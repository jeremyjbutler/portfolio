#!/bin/bash

# Deploy local Docker registry to Kubernetes cluster
set -e

echo "📦 Deploying Local Docker Registry to Kubernetes"
echo "==============================================="

# Deploy the registry
echo "🚀 Deploying Docker registry..."
kubectl apply -f k8s/registry.yaml

# Wait for registry to be ready
echo "⏳ Waiting for registry to be ready..."
kubectl wait --namespace=registry --for=condition=available --timeout=300s deployment/docker-registry

# Get registry service details
echo "📋 Registry service status:"
kubectl get all -n registry

# Add registry.local to /etc/hosts on all nodes
echo ""
echo "🌐 Configuring registry.local DNS on cluster nodes..."

REGISTRY_IP=$(kubectl get ingress registry-ingress -n registry -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
if [ -z "$REGISTRY_IP" ]; then
    # Fallback to service IP
    REGISTRY_IP=$(kubectl get svc docker-registry-service -n registry -o jsonpath='{.spec.clusterIP}')
fi

echo "Registry IP: $REGISTRY_IP"

# Configure each node to resolve registry.local
NODES=("192.168.1.201" "192.168.1.200" "192.168.1.123")
for node in "${NODES[@]}"; do
    echo "   🔧 Configuring $node..."
    if ping -c 1 -W 1 "$node" >/dev/null 2>&1; then
        ssh -i ~/.ssh/id_rsa_mci_ansible "root@$node" "
            # Remove existing registry.local entry
            sed -i '/registry.local/d' /etc/hosts
            # Add new registry.local entry
            echo '$REGISTRY_IP registry.local' >> /etc/hosts
            # Configure containerd to use insecure registry
            mkdir -p /etc/rancher/k3s
            if ! grep -q 'registry.local' /etc/rancher/k3s/registries.yaml 2>/dev/null; then
                cat >> /etc/rancher/k3s/registries.yaml << EOF
mirrors:
  registry.local:5000:
    endpoint:
      - \"http://registry.local:5000\"
configs:
  registry.local:5000:
    tls:
      insecure_skip_verify: true
EOF
                # Restart k3s to pick up new registry config
                systemctl restart k3s || systemctl restart k3s-agent || true
            fi
        "
        echo "   ✅ Configured $node"
    else
        echo "   ⚠️  Node $node not reachable"
    fi
done

# Test registry access
echo ""
echo "🧪 Testing registry access..."
sleep 10  # Wait for services to stabilize

# Port forward for local access
echo "🔗 Setting up port forward for local access..."
kubectl port-forward -n registry service/docker-registry-service 5000:5000 &
PORT_FORWARD_PID=$!
sleep 5

# Test registry
if curl -s http://localhost:5000/v2/ | grep -q "{}"; then
    echo "✅ Registry is accessible locally"
    
    # Kill port forward
    kill $PORT_FORWARD_PID 2>/dev/null || true
    
    echo ""
    echo "🎉 Local Docker Registry Setup Complete!"
    echo ""
    echo "📋 Registry Details:"
    echo "   Internal URL: http://docker-registry-service.registry.svc.cluster.local:5000"
    echo "   External URL: http://registry.local:5000 (via ingress)"
    echo "   Local Access: kubectl port-forward -n registry service/docker-registry-service 5000:5000"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Add registry.local to your local /etc/hosts file"
    echo "2. Configure Docker to use insecure registry"
    echo "3. Push images: docker tag <image> registry.local:5000/<image>"
    echo "4. Update deployment manifests to use registry.local:5000/<image>"
    
else
    echo "❌ Registry is not accessible"
    kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi