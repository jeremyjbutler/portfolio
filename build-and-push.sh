#!/bin/bash

set -e

# Configuration
REGISTRY=${REGISTRY:-"192.168.1.123:32000"}
PLATFORM=${PLATFORM:-"linux/amd64"}

echo "🏗️  Building and Pushing Portfolio Images"
echo "=========================================="
echo "📅 Started at: $(date)"
echo "🏗️  Platform: $PLATFORM"
echo "📦 Registry: $REGISTRY"
echo ""

# Check if docker buildx is available
if ! docker buildx version &> /dev/null; then
    echo "❌ Docker buildx is not available. Please ensure Docker Desktop or buildx is installed."
    exit 1
fi

# Build frontend image
echo "🔨 Building frontend image..."
if docker buildx build \
    --platform $PLATFORM \
    -t portfolio-frontend:latest \
    -f frontend/Dockerfile.prod \
    ./frontend \
    --load; then
    echo "✅ Frontend image built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Tag and push frontend image
echo "🏷️  Tagging frontend image for registry..."
docker tag portfolio-frontend:latest $REGISTRY/portfolio-frontend:latest
echo "📤 Pushing frontend image to registry..."
if docker push $REGISTRY/portfolio-frontend:latest; then
    echo "✅ Frontend image pushed successfully"
else
    echo "❌ Frontend push failed"
    exit 1
fi

echo ""

# Build backend image
echo "🔨 Building backend image..."
if docker buildx build \
    --platform $PLATFORM \
    -t portfolio-backend:latest \
    -f backend/Dockerfile.prod \
    ./backend \
    --load; then
    echo "✅ Backend image built successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Tag and push backend image
echo "🏷️  Tagging backend image for registry..."
docker tag portfolio-backend:latest $REGISTRY/portfolio-backend:latest
echo "📤 Pushing backend image to registry..."
if docker push $REGISTRY/portfolio-backend:latest; then
    echo "✅ Backend image pushed successfully"
else
    echo "❌ Backend push failed"
    exit 1
fi

echo ""
echo "🎉 All images built and pushed successfully!"
echo "📦 Images available in registry:"
echo "   - $REGISTRY/portfolio-frontend:latest"
echo "   - $REGISTRY/portfolio-backend:latest"
echo ""
echo "💡 To deploy to Kubernetes, run: ./deploy-k8s.sh"