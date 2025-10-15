#!/bin/bash

# Configuration (with environment variable defaults)
DOMAIN=${DOMAIN:-"portfolio.devop.foo"}
CLOUDFLARE_ZONE=${CLOUDFLARE_ZONE:-"devop.foo"}

echo "🌐 Configuring Cloudflare DNS for $DOMAIN"
echo "===================================================="

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN environment variable is required"
    echo "   Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "   Export it: export CLOUDFLARE_API_TOKEN=your_token_here"
    exit 1
fi

# Check if ansible is installed
if ! command -v ansible-playbook &> /dev/null; then
    echo "⚠️  Ansible not found. Installing requirements manually via curl..."
    
    # Get ingress IP from Kubernetes
    echo "🔍 Getting Kubernetes ingress IP..."
    INGRESS_IP=$(kubectl get ingress portfolio-ingress -n portfolio -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [ -z "$INGRESS_IP" ]; then
        echo "❌ Could not get ingress IP. Make sure the deployment is complete."
        echo "   Run: kubectl get ingress portfolio-ingress -n portfolio"
        exit 1
    fi
    
    echo "📍 Ingress IP: $INGRESS_IP"
    
    # Get Cloudflare zone ID
    echo "🔍 Getting Cloudflare zone ID..."
    ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$CLOUDFLARE_ZONE" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    ZONE_ID=$(echo $ZONE_RESPONSE | jq -r '.result[0].id')
    
    if [ "$ZONE_ID" == "null" ] || [ -z "$ZONE_ID" ]; then
        echo "❌ Could not get zone ID for $CLOUDFLARE_ZONE. Check your API token permissions."
        exit 1
    fi
    
    echo "🆔 Zone ID: $ZONE_ID"
    
    # Check for existing record
    echo "🔍 Checking for existing DNS record..."
    EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$DOMAIN&type=A" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    RECORD_COUNT=$(echo $EXISTING_RECORD | jq '.result | length')
    
    if [ "$RECORD_COUNT" -eq 0 ]; then
        # Create new record
        echo "📝 Creating new DNS A record..."
        RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data '{
                "type": "A",
                "name": "portfolio",
                "content": "'$INGRESS_IP'",
                "ttl": 1,
                "proxied": true
            }')
        ACTION="Created"
    else
        # Update existing record
        echo "📝 Updating existing DNS A record..."
        RECORD_ID=$(echo $EXISTING_RECORD | jq -r '.result[0].id')
        RESULT=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data '{
                "type": "A",
                "name": "portfolio",
                "content": "'$INGRESS_IP'",
                "ttl": 1,
                "proxied": true
            }')
        ACTION="Updated"
    fi
    
    # Check if successful
    SUCCESS=$(echo $RESULT | jq -r '.success')
    
    if [ "$SUCCESS" == "true" ]; then
        echo ""
        echo "✅ DNS Configuration Complete!"
        echo ""
        echo "📋 Configuration Details:"
        echo "   Domain: $DOMAIN"
        echo "   IP: $INGRESS_IP"
        echo "   Status: $ACTION"
        echo "   Proxied: Yes (Cloudflare DDoS protection enabled)"
        echo ""
        echo "🌐 Your portfolio will be available at: https://$DOMAIN"
        echo ""
        echo "⏳ Note: DNS propagation may take a few minutes."
        
        # Test DNS resolution
        echo ""
        echo "🧪 Testing DNS resolution..."
        sleep 5
        DNS_RESULT=$(dig +short $DOMAIN 2>/dev/null || echo "not resolved")
        echo "   Result: $DNS_RESULT"
        
        if [ "$DNS_RESULT" != "not resolved" ] && [ ! -z "$DNS_RESULT" ]; then
            echo "✅ DNS is resolving correctly!"
        else
            echo "⏳ DNS not yet propagated. This is normal and should resolve within 5-10 minutes."
        fi
    else
        echo "❌ Failed to configure DNS"
        echo "Error details:"
        echo $RESULT | jq '.errors'
        exit 1
    fi
    
else
    # Use Ansible playbook
    echo "🤖 Running Ansible playbook for DNS configuration..."
    ansible-playbook ansible/cloudflare-dns.yml
fi

echo ""
echo "✅ Cloudflare DNS configuration completed!"