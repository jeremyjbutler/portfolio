#!/bin/bash

set -e

START_TIME=$(date +%s)

echo "🚀 Reliable Portfolio Deployment Script"
echo "======================================="
echo "📅 Started at: $(date)"
echo ""

# Configuration
DOMAIN=${DOMAIN:-"portfolio.devop.foo"}
NAMESPACE=${NAMESPACE:-"portfolio"}
REGISTRY=${REGISTRY:-"192.168.1.123:32000"}
PLATFORM=${PLATFORM:-"linux/amd64"}

echo "⚙️  Configuration:"
echo "   Domain: $DOMAIN"
echo "   Namespace: $NAMESPACE"
echo "   Registry: $REGISTRY"
echo "   Platform: $PLATFORM"
echo ""

# Step 1: Build and push images with correct architecture
echo "🏗️  Step 1: Building images for $PLATFORM..."

echo "   🔨 Building frontend..."
docker buildx build --platform $PLATFORM \
  -t portfolio-frontend:latest \
  -f frontend/Dockerfile.prod ./frontend --load

echo "   🔨 Building backend..."
docker buildx build --platform $PLATFORM \
  -t portfolio-backend:latest \
  -f backend/Dockerfile.prod ./backend --load

echo "   🏷️  Tagging for registry..."
docker tag portfolio-frontend:latest $REGISTRY/portfolio-frontend:latest
docker tag portfolio-backend:latest $REGISTRY/portfolio-backend:latest

echo "   📤 Pushing to registry..."
docker push $REGISTRY/portfolio-frontend:latest
docker push $REGISTRY/portfolio-backend:latest

echo "✅ Images built and pushed successfully"
echo ""

# Step 2: Clean up any problematic pods
echo "🧹 Step 2: Cleaning up problematic pods..."
kubectl delete pods -n $NAMESPACE --field-selector=status.phase!=Running 2>/dev/null || true
kubectl delete pods -n $NAMESPACE -l app=portfolio-frontend --field-selector=status.phase=Failed 2>/dev/null || true
kubectl delete pods -n $NAMESPACE -l app=portfolio-backend --field-selector=status.phase=Failed 2>/dev/null || true
echo "✅ Cleanup completed"
echo ""

# Step 3: Force rollout restart to get new images
echo "🔄 Step 3: Rolling out new deployment..."
kubectl rollout restart deployment portfolio-frontend -n $NAMESPACE
kubectl rollout restart deployment portfolio-backend -n $NAMESPACE

echo "   ⏳ Waiting for frontend deployment..."
kubectl rollout status deployment/portfolio-frontend -n $NAMESPACE --timeout=120s

echo "   ⏳ Waiting for backend deployment..."  
kubectl rollout status deployment/portfolio-backend -n $NAMESPACE --timeout=120s

echo "✅ Deployments completed successfully"
echo ""

# Step 4: Verify everything is working
echo "🔍 Step 4: Verifying deployment..."
echo "   📊 Pod status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "   🌐 Testing endpoints..."
echo "   Testing frontend via ingress..."
if curl -s -H "Host: $DOMAIN" http://192.168.1.200/ | grep -q "Jeremy Butler"; then
    echo "   ✅ Frontend is responding"
else
    echo "   ⚠️  Frontend test failed"
fi

echo "   Testing backend health..."
if curl -s -H "Host: $DOMAIN" http://192.168.1.200/health | grep -q "healthy"; then
    echo "   ✅ Backend is responding"
else
    echo "   ⚠️  Backend test failed"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "📋 Access your portfolio:"
echo "   🌐 Direct K8s: http://192.168.1.200 (Host: $DOMAIN)"
echo "   🔐 HTTPS: https://$DOMAIN"
echo "   🔐 HTTPS: https://jeremy.devop.foo"
echo "   🔐 HTTPS: https://jb.devop.foo"
echo ""
echo "⏱️  Total deployment time: $(($(date +%s) - START_TIME)) seconds"