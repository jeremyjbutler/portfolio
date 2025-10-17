#!/bin/bash

START_TIME=$(date +%s)

echo "🚀 Quick Kubernetes Deployment (Skip Docker Build)"
echo "=================================================="
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

# Check Kubernetes connectivity
echo "☸️  Checking Kubernetes connectivity..."
if ! kubectl cluster-info --request-timeout=10s >/dev/null 2>&1; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "   Please ensure kubectl is configured and cluster is accessible"
    exit 1
fi
echo "   ✅ Kubernetes cluster connection verified"

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

# Apply Kubernetes manifests
echo ""
echo "📋 Applying Kubernetes manifests..."
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
echo "🌐 Deploying frontend services..."
echo "   📄 Applying: 02-frontend-deployment.yaml"
if kubectl apply -f "$TEMP_DIR/02-frontend-deployment.yaml"; then
    echo "   ✅ Frontend deployment applied"
else
    echo "   ❌ Failed to apply frontend deployment"
    exit 1
fi

# Apply ingress configuration
echo ""
echo "🌍 Configuring ingress..."
echo "   📄 Applying: 03-ingress.yaml"
if kubectl apply -f "$TEMP_DIR/03-ingress.yaml"; then
    echo "   ✅ Ingress configuration applied"
else
    echo "   ❌ Failed to apply ingress configuration"
    exit 1
fi

# Wait for deployments to be ready
echo ""
echo "⏳ Waiting for deployments to be ready..."

echo "   🔧 Waiting for backend deployment..."
if kubectl wait --for=condition=available --timeout=300s deployment/portfolio-backend -n $NAMESPACE; then
    echo "   ✅ Backend deployment is ready"
else
    echo "   ⚠️  Backend deployment may not be fully ready"
fi

echo "   🌐 Waiting for frontend deployment..."
if kubectl wait --for=condition=available --timeout=300s deployment/portfolio-frontend -n $NAMESPACE; then
    echo "   ✅ Frontend deployment is ready"
else
    echo "   ⚠️  Frontend deployment may not be fully ready"
fi

# Get ingress information
echo ""
echo "🌍 Getting ingress information..."
INGRESS_IP=""
for i in {1..30}; do
    INGRESS_IP=$(kubectl get ingress portfolio-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -z "$INGRESS_IP" ]; then
        INGRESS_IP=$(kubectl get ingress portfolio-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    fi
    if [ -n "$INGRESS_IP" ]; then
        break
    fi
    echo "   ⏳ Waiting for ingress IP/hostname (attempt $i/30)..."
    sleep 10
done

if [ -n "$INGRESS_IP" ]; then
    echo "   ✅ Ingress ready"
    echo "   🌐 Ingress IP/Hostname: $INGRESS_IP"
else
    echo "   ⚠️  Could not get ingress IP. Check ingress controller status:"
    echo "   Run: kubectl get ingress -n $NAMESPACE"
    INGRESS_IP="<pending>"
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
echo "   Name: $(echo $DOMAIN | cut -d'.' -f1)"
echo "   Value: $INGRESS_IP"
echo "   TTL: Auto"
echo ""
echo "2. 🔗 Your portfolio will be available at:"
echo "   https://$DOMAIN"
echo ""
echo "3. 🔧 To configure DNS automatically, run:"
echo "   ./configure-dns.sh"
echo ""
echo "📊 Check deployment status:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get services -n $NAMESPACE"
echo "   kubectl get ingress -n $NAMESPACE"

ELAPSED=$(($(date +%s) - START_TIME))
echo ""
echo "⏱️  Total deployment time: ${ELAPSED}s"