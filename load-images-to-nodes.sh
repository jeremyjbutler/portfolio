#!/bin/bash

# Load Docker images to K3s cluster nodes
# This script saves Docker images locally and loads them to each cluster node

set -e

echo "📦 Loading Docker images to K3s cluster nodes"
echo "=============================================="

# Configuration
IMAGES=("portfolio-frontend:latest" "portfolio-backend:latest")
TEMP_DIR="./docker-images"
NODES=(
    "192.168.1.201"  # k3s-cp-deathstar
    "192.168.1.200"  # k3s-cp-ed700
    "192.168.1.123"  # whitehorse
)

# Create temporary directory for image files
mkdir -p "$TEMP_DIR"
echo "📁 Created temporary directory: $TEMP_DIR"

# Save images to tar files
echo ""
echo "💾 Saving Docker images to files..."
for image in "${IMAGES[@]}"; do
    echo "   📦 Saving: $image"
    docker save "$image" -o "$TEMP_DIR/$(echo $image | tr ':/' '_').tar"
    echo "   ✅ Saved to: $TEMP_DIR/$(echo $image | tr ':/' '_').tar"
done

# Load images to each node
echo ""
echo "🚀 Loading images to cluster nodes..."
for node in "${NODES[@]}"; do
    echo ""
    echo "🔄 Processing node: $node"
    
    # Check if node is reachable
    if ! ping -c 1 -W 1 "$node" >/dev/null 2>&1; then
        echo "   ⚠️  Node $node is not reachable, skipping..."
        continue
    fi
    
    # Copy and load each image
    for image in "${IMAGES[@]}"; do
        image_file="$(echo $image | tr ':/' '_').tar"
        echo "   📤 Uploading: $image_file to $node"
        
        # Copy image file to node
        if scp -i ~/.ssh/id_rsa_mci_ansible "$TEMP_DIR/$image_file" "root@$node:/tmp/$image_file"; then
            echo "   📥 Loading image on $node: $image"
            
            # Load image into containerd (K3s uses containerd)
            if ssh -i ~/.ssh/id_rsa_mci_ansible "root@$node" "ctr -n k8s.io images import /tmp/$image_file && rm /tmp/$image_file"; then
                echo "   ✅ Successfully loaded $image on $node"
            else
                echo "   ❌ Failed to load $image on $node"
            fi
        else
            echo "   ❌ Failed to upload $image_file to $node"
        fi
    done
done

# Clean up temporary files
echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
echo "✅ Cleanup complete"

echo ""
echo "🎉 Docker images loading complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify images are loaded: kubectl get pods -n portfolio"
echo "2. If pods are still failing, restart deployment: kubectl rollout restart deployment -n portfolio"
echo "3. Check pod status: kubectl describe pod <pod-name> -n portfolio"