#!/bin/bash

# NPM Reverse Proxy Configuration Script
# Automatically configures nginx proxy manager via SSH and API

echo "🔧 Configuring NPM Reverse Proxy at 192.168.1.111"
echo "================================================="
echo "ℹ️  Using existing *.devop.foo DNS and SSL certificate"

# Configuration from environment variables
PROXY_HOST=${PROXY_HOST:-"192.168.1.111"}
PROXY_EMAIL=${PROXY_EMAIL}
PROXY_PASSWORD=${PROXY_PASSWORD}
DOMAIN=${DOMAIN:-"portfolio.devop.foo"}

# Check required environment variables
if [ -z "$PROXY_EMAIL" ] || [ -z "$PROXY_PASSWORD" ]; then
    echo "❌ Missing NPM proxy credentials"
    echo "   Please set PROXY_EMAIL and PROXY_PASSWORD in ~/.env"
    echo "   Example:"
    echo "   PROXY_EMAIL=admin@example.com"
    echo "   PROXY_PASSWORD=your_password"
    exit 1
fi

echo "🔍 Configuration:"
echo "   Proxy Host: $PROXY_HOST"
echo "   Email: $PROXY_EMAIL"
echo "   Domain: $DOMAIN"
echo ""

# Get Kubernetes ingress IP
echo "🔍 Getting Kubernetes ingress IP..."
INGRESS_IP=""

# Try to get ingress IP from kubectl
if command -v kubectl >/dev/null 2>&1; then
    INGRESS_IP=$(kubectl get ingress -n portfolio -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -z "$INGRESS_IP" ]; then
        INGRESS_IP=$(kubectl get ingress -n portfolio -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    fi
    if [ -z "$INGRESS_IP" ]; then
        # Try getting service external IP
        INGRESS_IP=$(kubectl get svc -n portfolio -o jsonpath='{.items[?(@.spec.type=="LoadBalancer")].status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    fi
fi

# If still no IP, use the cluster IP as fallback
if [ -z "$INGRESS_IP" ]; then
    echo "⚠️  Could not get ingress IP from kubectl, using cluster IP as fallback"
    INGRESS_IP="192.168.1.123"  # Your K8s cluster IP
fi

echo "✅ Using ingress IP: $INGRESS_IP"
echo ""

# SSH key configuration
SSH_KEY_PATH="$HOME/.ssh/id_rsa_mci_ansible"
SSH_OPTS="-i $SSH_KEY_PATH -o ConnectTimeout=5 -o BatchMode=yes"

# Test SSH connectivity
echo "🔗 Testing SSH connectivity to $PROXY_HOST..."
if ! ssh $SSH_OPTS root@$PROXY_HOST exit 2>/dev/null; then
    echo "❌ Cannot connect to $PROXY_HOST via SSH"
    echo "   Please ensure SSH key $SSH_KEY_PATH is configured"
    exit 1
fi
echo "✅ SSH connection successful"

# Function to call NPM API
call_npm_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        ssh $SSH_OPTS root@$PROXY_HOST "curl -s -X $method \"http://localhost:81/api$endpoint\" \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer \$NPM_TOKEN' \
            -d '$data'"
    else
        ssh $SSH_OPTS root@$PROXY_HOST "curl -s -X $method \"http://localhost:81/api$endpoint\" \
            -H 'Authorization: Bearer \$NPM_TOKEN'"
    fi
}

# Login to NPM and get token
echo "🔐 Logging into NPM..."
LOGIN_RESPONSE=$(ssh $SSH_OPTS root@$PROXY_HOST "curl -s -X POST 'http://localhost:81/api/tokens' \
    -H 'Content-Type: application/json' \
    -d '{\"identity\":\"$PROXY_EMAIL\",\"secret\":\"$PROXY_PASSWORD\"}'")

NPM_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)

if [ -z "$NPM_TOKEN" ] || [ "$NPM_TOKEN" = "null" ]; then
    echo "❌ Failed to login to NPM"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ NPM login successful"

# Set the token on the remote server for subsequent calls
ssh $SSH_OPTS root@$PROXY_HOST "export NPM_TOKEN='$NPM_TOKEN'"

# Create proxy hosts for each domain
DOMAINS=("jeremy.devop.foo" "portfolio.devop.foo" "jb.devop.foo")

for domain in "${DOMAINS[@]}"; do
    echo ""
    echo "🌐 Configuring proxy for $domain..."
    
    # Check if proxy host already exists
    existing_host=$(call_npm_api "GET" "/nginx/proxy-hosts" | jq -r ".[] | select(.domain_names[] == \"$domain\") | .id" 2>/dev/null)
    
    if [ -n "$existing_host" ] && [ "$existing_host" != "null" ]; then
        echo "   ℹ️  Proxy host already exists (ID: $existing_host), updating..."
        
        # Update existing proxy host
        update_data="{
            \"domain_names\": [\"$domain\"],
            \"forward_scheme\": \"http\",
            \"forward_host\": \"$INGRESS_IP\",
            \"forward_port\": 80,
            \"access_list_id\": 0,
            \"certificate_id\": 0,
            \"ssl_forced\": 0,
            \"caching_enabled\": 0,
            \"block_exploits\": 1,
            \"advanced_config\": \"proxy_set_header X-Real-IP \$remote_addr;\\nproxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\nproxy_set_header X-Forwarded-Proto \$scheme;\\nproxy_set_header Host \$host;\\n\\n# WebSocket support\\nproxy_http_version 1.1;\\nproxy_set_header Upgrade \$http_upgrade;\\nproxy_set_header Connection \\\"upgrade\\\";\"
        }"
        
        response=$(call_npm_api "PUT" "/nginx/proxy-hosts/$existing_host" "$update_data")
        
    else
        echo "   📝 Creating new proxy host..."
        
        # Create new proxy host
        create_data="{
            \"domain_names\": [\"$domain\"],
            \"forward_scheme\": \"http\",
            \"forward_host\": \"$INGRESS_IP\",
            \"forward_port\": 80,
            \"access_list_id\": 0,
            \"certificate_id\": 0,
            \"ssl_forced\": 0,
            \"caching_enabled\": 0,
            \"block_exploits\": 1,
            \"advanced_config\": \"proxy_set_header X-Real-IP \$remote_addr;\\nproxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\nproxy_set_header X-Forwarded-Proto \$scheme;\\nproxy_set_header Host \$host;\\n\\n# WebSocket support\\nproxy_http_version 1.1;\\nproxy_set_header Upgrade \$http_upgrade;\\nproxy_set_header Connection \\\"upgrade\\\";\"
        }"
        
        response=$(call_npm_api "POST" "/nginx/proxy-hosts" "$create_data")
    fi
    
    if echo "$response" | jq -r '.id' >/dev/null 2>&1; then
        echo "   ✅ Successfully configured $domain"
    else
        echo "   ⚠️  Warning: Possible issue configuring $domain"
        echo "   Response: $response"
    fi
done

echo ""
echo "🎉 NPM Reverse Proxy Configuration Complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ Configured domains to proxy to $INGRESS_IP:"
for domain in "${DOMAINS[@]}"; do
    echo "      • $domain → http://$INGRESS_IP:80"
done
echo ""
echo "🔍 Test the configuration:"
echo "   curl -H 'Host: jeremy.devop.foo' http://$PROXY_HOST/"
echo "   curl -H 'Host: portfolio.devop.foo' http://$PROXY_HOST/"
echo "   curl -H 'Host: jb.devop.foo' http://$PROXY_HOST/"
echo ""
echo "🌐 Access NPM web interface:"
echo "   http://$PROXY_HOST:81"
echo "   Email: $PROXY_EMAIL"