#!/bin/bash

set -e

# Track deployment time
START_TIME=$(date +%s)

# Parse command line arguments
BUILD_IMAGES=true
for arg in "$@"; do
    case $arg in
        --skip-build)
            BUILD_IMAGES=false
            shift
            ;;
        --build)
            BUILD_IMAGES=true
            shift
            ;;
        *)
            ;;
    esac
done

echo "🚀 Deploying Jeremy Butler's Portfolio to Production Kubernetes"
echo "=============================================================="
echo "📅 Started at: $(date)"
echo ""

# Configuration (with environment variable defaults)
DOMAIN=${DOMAIN:-"portfolio.devop.foo"}
NAMESPACE=${NAMESPACE:-"portfolio"}
REGISTRY=${REGISTRY:-"192.168.1.123:32000"}
EMAIL=${EMAIL:-"admin@${DOMAIN}"}
CLOUDFLARE_ZONE=${CLOUDFLARE_ZONE:-"devop.foo"}
PLATFORM=${PLATFORM:-"linux/amd64"}

# Export variables for envsubst
export DOMAIN NAMESPACE REGISTRY EMAIL CLOUDFLARE_ZONE

echo "⚙️  Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Namespace: $NAMESPACE"
echo "   Cloudflare Zone: $CLOUDFLARE_ZONE" 
echo "   Registry: $REGISTRY"
echo "   Platform: $PLATFORM"
echo "   Build Images: $BUILD_IMAGES"
echo ""

# Check if kubectl is available
echo "🔍 Checking prerequisites..."
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi
echo "   ✅ kubectl found: $(kubectl version --client 2>/dev/null | head -1 || echo 'kubectl installed')"

# Check if we can connect to the cluster
echo "   🔗 Testing cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    echo "Current context: $(kubectl config current-context 2>/dev/null || echo 'none')"
    exit 1
fi

echo "   ✅ Kubernetes cluster connection verified"
echo "   📊 Cluster info:"
kubectl cluster-info | head -2 | sed 's/^/      /'
echo "   🎯 Current context: $(kubectl config current-context)"
echo ""

# Build production images (conditional)
if [ "$BUILD_IMAGES" = true ]; then
    echo "🏗️  Building production Docker images..."
    echo "   📦 Building images for $PLATFORM architecture..."

    echo "   🔨 Building frontend image..."
    if docker buildx build --platform $PLATFORM -t portfolio-frontend:latest -f frontend/Dockerfile.prod ./frontend --load; then
        echo "   ✅ Frontend image built successfully"
    else
        echo "   ❌ Frontend build failed"
        exit 1
    fi

    echo "   🔨 Building backend image..."
    if docker buildx build --platform $PLATFORM -t portfolio-backend:latest -f backend/Dockerfile.prod ./backend --load; then
        echo "   ✅ Backend image built successfully"
    else
        echo "   ❌ Backend build failed"
        exit 1
    fi
else
    echo "⏩ Skipping image build (using existing images)"
fi

echo ""
echo "📋 Checking built images:"
docker images | grep -E "(portfolio-frontend|portfolio-backend)" | sed 's/^/   /'
echo ""

# Test registry connectivity
echo "🔗 Testing registry connectivity..."
if curl -s "http://$REGISTRY/v2/" | grep -q "{}"; then
    echo "   ✅ Registry is accessible at $REGISTRY"
else
    echo "   ❌ Registry is not accessible at $REGISTRY"
    exit 1
fi

# Tag images for registry
echo "🏷️  Tagging images for registry..."
echo "   🏷️  Tagging frontend: portfolio-frontend:latest -> $REGISTRY/portfolio-frontend:latest"
docker tag portfolio-frontend:latest $REGISTRY/portfolio-frontend:latest
echo "   🏷️  Tagging backend: portfolio-backend:latest -> $REGISTRY/portfolio-backend:latest"  
docker tag portfolio-backend:latest $REGISTRY/portfolio-backend:latest
echo "   ✅ Images tagged successfully"

# Push to registry
echo "📤 Pushing images to local registry..."
echo "   📤 Pushing frontend image..."
if docker push $REGISTRY/portfolio-frontend:latest; then
    echo "   ✅ Frontend image pushed successfully"
else
    echo "   ❌ Failed to push frontend image"
    exit 1
fi

echo "   📤 Pushing backend image..."
if docker push $REGISTRY/portfolio-backend:latest; then
    echo "   ✅ Backend image pushed successfully"
else
    echo "   ❌ Failed to push backend image"
    exit 1
fi

echo "   ✅ Images successfully pushed to registry"

# Update image references in k8s manifests if using external registry
if [ "$REGISTRY" != "your-registry.com" ]; then
    echo "📝 Updating Kubernetes manifests with registry URLs..."
    sed -i.bak "s|image: portfolio-frontend:latest|image: $REGISTRY/portfolio-frontend:latest|g" k8s/02-frontend-deployment.yaml
    sed -i.bak "s|image: portfolio-backend:latest|image: $REGISTRY/portfolio-backend:latest|g" k8s/01-backend-deployment.yaml
fi

# Apply Kubernetes manifests
echo ""
echo "📋 Applying Kubernetes manifests..."
echo ""

# Check for required environment variables
echo "🔐 Checking environment variables..."
if [ -z "$JWT_SECRET" ]; then
    echo "   ⚠️  JWT_SECRET not set, generating secure random secret..."
    export JWT_SECRET="jwt-$(openssl rand -hex 32)"
    echo "   ✅ Generated JWT_SECRET: ${JWT_SECRET:0:10}..."
fi

# Create temporary directory for processed manifests
TEMP_DIR=$(mktemp -d)
echo "📁 Processing manifests in temporary directory: $TEMP_DIR"

# Process manifests with environment variable substitution
echo "🔄 Substituting environment variables in manifests..."
for file in k8s/*.yaml; do
    filename=$(basename "$file")
    echo "   🔄 Processing: $filename"
    envsubst < "$file" > "$TEMP_DIR/$filename"
done
echo "   ✅ All manifests processed with environment variables"
echo ""

# Create namespace and configurations first
echo "🏷️  Creating namespace and configurations..."

# Check if namespace exists first
if kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
    echo "   ✅ Namespace '$NAMESPACE' already exists, updating configuration..."
else
    echo "   📝 Creating new namespace '$NAMESPACE'..."
fi

echo "   📄 Applying: 00-namespace-config.yaml (with environment substitution)"
if kubectl apply -f "$TEMP_DIR/00-namespace-config.yaml"; then
    echo "   ✅ Namespace configuration applied"
else
    echo "   ❌ Failed to apply namespace configuration"
    exit 1
fi

# Check namespace status (skip waiting if it already exists and is active)
NS_STATUS=$(kubectl get namespace $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
if [ "$NS_STATUS" = "Active" ]; then
    echo "   ✅ Namespace '$NAMESPACE' is active and ready"
else
    echo "   ⏳ Waiting for namespace to be ready..."
    if kubectl wait --for=condition=Ready namespace/$NAMESPACE --timeout=30s 2>/dev/null; then
        echo "   ✅ Namespace '$NAMESPACE' is ready"
    else
        echo "   ⚠️  Namespace may not be fully ready, continuing..."
    fi
fi

# Apply SSL certificate configuration (if cert-manager is installed)
echo ""
echo "🔐 Checking SSL certificate configuration..."
if kubectl get crd certificates.cert-manager.io &> /dev/null; then
    echo "   ✅ cert-manager found, applying SSL certificate..."
    echo "   📄 Applying: 04-ssl-certificate.yaml"
    if kubectl apply -f "$TEMP_DIR/04-ssl-certificate.yaml"; then
        echo "   ✅ SSL certificate configuration applied"
    else
        echo "   ❌ Failed to apply SSL certificate configuration"
        exit 1
    fi
else
    echo "   ⚠️  cert-manager not found. SSL certificates will need to be configured manually."
fi

# Deploy backend
echo ""
echo "🔧 Deploying backend services..."
echo "   📄 Applying: 01-backend-deployment.yaml"
if kubectl apply -f "$TEMP_DIR/01-backend-deployment.yaml"; then
    echo "   ✅ Backend deployment applied"
else
    echo "   ❌ Failed to apply backend deployment"
    exit 1
fi

# Deploy frontend  
echo ""
echo "🎨 Deploying frontend services..."
echo "   📄 Applying: k8s/02-frontend-deployment.yaml"  
if kubectl apply -f "$TEMP_DIR/02-frontend-deployment.yaml"; then
    echo "   ✅ Frontend deployment applied"
else
    echo "   ❌ Failed to apply frontend deployment"
    exit 1
fi

# Deploy ingress
echo ""
echo "🌐 Deploying ingress configuration..."
echo "   📄 Applying: k8s/03-ingress.yaml"
if kubectl apply -f "$TEMP_DIR/03-ingress.yaml"; then
    echo "   ✅ Ingress configuration applied"
else
    echo "   ❌ Failed to apply ingress configuration"
    exit 1
fi

# Wait for deployments to be ready
echo ""
echo "⏳ Waiting for deployments to be ready..."
echo "   🔄 Checking backend deployment status..."
if kubectl rollout status deployment/portfolio-backend -n $NAMESPACE --timeout=300s; then
    echo "   ✅ Backend deployment is ready"
else
    echo "   ❌ Backend deployment failed or timed out"
    echo "   🔍 Debug info:"
    kubectl get pods -n $NAMESPACE | grep backend | sed 's/^/      /'
    exit 1
fi

echo "   🔄 Checking frontend deployment status..."
if kubectl rollout status deployment/portfolio-frontend -n $NAMESPACE --timeout=300s; then
    echo "   ✅ Frontend deployment is ready"  
else
    echo "   ❌ Frontend deployment failed or timed out"
    echo "   🔍 Debug info:"
    kubectl get pods -n $NAMESPACE | grep frontend | sed 's/^/      /'
    exit 1
fi

# Show deployment status
echo ""
echo "📊 Current Deployment Status:"
echo ""
echo "🏷️  Pods:"
kubectl get pods -n $NAMESPACE | sed 's/^/   /'
echo ""
echo "🔧 Services:"  
kubectl get services -n $NAMESPACE | sed 's/^/   /'
echo ""
echo "🌐 Ingress:"
kubectl get ingress -n $NAMESPACE | sed 's/^/   /'

# Get ingress IP
echo ""
echo "🔍 Getting ingress IP address..."
INGRESS_IP=$(kubectl get ingress portfolio-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
if [ "$INGRESS_IP" = "pending" ]; then
    echo "   ⏳ Ingress IP is still pending, checking external IP..."
    INGRESS_IP=$(kubectl get ingress portfolio-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")
fi
echo "   🌐 Ingress IP/Hostname: $INGRESS_IP"

echo ""

# Cleanup temporary directory
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
echo "   ✅ Temporary files cleaned up"

echo ""
echo ""

# Configure NPM Reverse Proxy
echo "� Configuring NPM Reverse Proxy..."
if [ -n "$PROXY_EMAIL" ] && [ -n "$PROXY_PASSWORD" ]; then
    echo "   📡 Running proxy configuration..."
    if ./configure-proxy.sh; then
        echo "   ✅ NPM proxy configured successfully"
    else
        echo "   ⚠️  NPM proxy configuration failed, you can run it manually:"
        echo "   ./configure-proxy.sh"
    fi
else
    echo "   ⚠️  NPM proxy credentials not set, skipping automatic configuration"
    echo "   To configure manually, set PROXY_EMAIL and PROXY_PASSWORD in ~/.env and run:"
    echo "   ./configure-proxy.sh"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "📅 Completed at: $(date)"
echo ""
echo "📋 Next Steps:"
echo "1. 🔧 Configure NPM reverse proxy hosts (if not already done):"
echo "   ./configure-proxy.sh"
echo ""
echo "2. 🔗 Your portfolio will be available at:"
echo "   https://jeremy.devop.foo"
echo "   https://portfolio.devop.foo"
echo "   https://jb.devop.foo"
echo ""
echo "ℹ️  DNS & SSL: Already configured with *.devop.foo wildcard"

# Restore original manifests if modified
if [ "$REGISTRY" != "your-registry.com" ] && [ -f "k8s/02-frontend-deployment.yaml.bak" ]; then
    echo "📝 Restoring original manifest files..."
    mv k8s/02-frontend-deployment.yaml.bak k8s/02-frontend-deployment.yaml
    mv k8s/01-backend-deployment.yaml.bak k8s/01-backend-deployment.yaml
fi

echo ""
echo "✅ Portfolio deployment script completed successfully!"
echo "⏱️  Total deployment time: $(($(date +%s) - START_TIME)) seconds" 
echo "📊 Final status check:"
kubectl get all -n $NAMESPACE | sed 's/^/   /'