#!/bin/bash

set -e

# Track deployment time
START_TIME=$(date +%s)

echo "🚀 Deploying Jeremy Butler's Portfolio to Production Kubernetes"
echo "=============================================================="
echo "📅 Started at: $(date)"
echo ""

# Configuration (with environment variable defaults)
DOMAIN=${DOMAIN:-"portfolio.devop.foo"}
NAMESPACE=${NAMESPACE:-"portfolio"}
REGISTRY=${REGISTRY:-"your-registry.com"}
EMAIL=${EMAIL:-"admin@${DOMAIN}"}
CLOUDFLARE_ZONE=${CLOUDFLARE_ZONE:-"devop.foo"}

echo "⚙️  Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Namespace: $NAMESPACE"
echo "   Cloudflare Zone: $CLOUDFLARE_ZONE" 
echo "   Registry: $REGISTRY"
echo ""

# Check if kubectl is available
echo "🔍 Checking prerequisites..."
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi
echo "   ✅ kubectl found: $(kubectl version --client --short)"

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

# Build production images
echo "🏗️  Building production Docker images..."
echo "   📦 Starting Docker build process..."
if docker compose -f docker-compose.prod.yml build; then
    echo "   ✅ Docker images built successfully"
else
    echo "   ❌ Docker build failed"
    exit 1
fi

echo ""
echo "📋 Checking built images:"
docker images | grep -E "(portfolio-frontend|portfolio-backend)" | sed 's/^/   /'
echo ""

# Tag images for registry (update registry URL as needed)
echo "🏷️  Tagging images for registry..."
echo "   🏷️  Tagging frontend: portfolio-frontend:latest -> $REGISTRY/portfolio-frontend:latest"
docker tag portfolio-frontend:latest $REGISTRY/portfolio-frontend:latest
echo "   🏷️  Tagging backend: portfolio-backend:latest -> $REGISTRY/portfolio-backend:latest"  
docker tag portfolio-backend:latest $REGISTRY/portfolio-backend:latest
echo "   ✅ Images tagged successfully"

# Push to registry (uncomment when ready)
# echo "📤 Pushing images to registry..."
# docker push $REGISTRY/portfolio-frontend:latest
# docker push $REGISTRY/portfolio-backend:latest
echo "   ℹ️  Registry push skipped (using local images)"

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
echo "   📄 Applying: 00-namespace-config.yaml (with environment substitution)"
if kubectl apply -f "$TEMP_DIR/00-namespace-config.yaml"; then
    echo "   ✅ Namespace configuration applied"
else
    echo "   ❌ Failed to apply namespace configuration"
    exit 1
fi

# Wait for namespace to be ready  
echo "   ⏳ Waiting for namespace to be ready..."
if kubectl wait --for=condition=Ready namespace/$NAMESPACE --timeout=60s; then
    echo "   ✅ Namespace '$NAMESPACE' is ready"
else
    echo "   ⚠️  Namespace may not be fully ready, continuing..."
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
echo "🎉 Deployment Complete!"
echo "📅 Completed at: $(date)"
echo ""
echo "📋 Next Steps:"
echo "1. 🌐 Add DNS record in Cloudflare:"
echo "   Type: A (or CNAME if hostname)"
echo "   Name: portfolio"
echo "   Value: $INGRESS_IP"
echo "   TTL: Auto"
echo ""
echo "2. 🔗 Your portfolio will be available at:"
echo "   https://$DOMAIN"
echo ""
echo "3. 📊 Monitor deployment:"
echo "   kubectl get pods -n $NAMESPACE -w"
echo "   kubectl logs -f deployment/portfolio-backend -n $NAMESPACE"
echo "   kubectl logs -f deployment/portfolio-frontend -n $NAMESPACE"
echo ""
echo "4. 🔧 Useful commands:"
echo "   kubectl describe ingress portfolio-ingress -n $NAMESPACE"
echo "   kubectl get events -n $NAMESPACE --sort-by=.metadata.creationTimestamp"

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