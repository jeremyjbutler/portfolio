#!/bin/bash

# Configure DNS for all portfolio domains
# Points jeremy.devop.foo, portfolio.devop.foo, and jb.devop.foo to NPM proxy

echo "🌐 Configuring DNS for All Portfolio Domains"
echo "============================================="

# Configuration
PROXY_IP=${PROXY_HOST:-"192.168.1.111"}
CLOUDFLARE_ZONE=${CLOUDFLARE_ZONE:-"devop.foo"}
DOMAINS=("jeremy" "portfolio" "jb")

echo "🎯 Target: NPM Proxy Server ($PROXY_IP)"
echo "🌍 Zone: $CLOUDFLARE_ZONE"
echo ""

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN environment variable is required"
    echo "   Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "   Export it: export CLOUDFLARE_API_TOKEN=your_token_here"
    exit 1
fi

# Get Cloudflare zone ID
echo "🔍 Getting Cloudflare zone ID for $CLOUDFLARE_ZONE..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$CLOUDFLARE_ZONE" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

ZONE_ID=$(echo $ZONE_RESPONSE | jq -r '.result[0].id')

if [ "$ZONE_ID" == "null" ] || [ -z "$ZONE_ID" ]; then
    echo "❌ Could not get zone ID for $CLOUDFLARE_ZONE. Check your API token permissions."
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# Configure DNS for each domain
for subdomain in "${DOMAINS[@]}"; do
    FULL_DOMAIN="$subdomain.$CLOUDFLARE_ZONE"
    echo "🌐 Configuring DNS for $FULL_DOMAIN..."
    
    # Check if DNS record already exists
    EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$FULL_DOMAIN&type=A" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    RECORD_ID=$(echo $EXISTING_RECORD | jq -r '.result[0].id')
    
    if [ "$RECORD_ID" != "null" ] && [ -n "$RECORD_ID" ]; then
        # Update existing record
        echo "   🔄 Updating existing DNS record..."
        RESULT=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{
                \"type\": \"A\",
                \"name\": \"$subdomain\",
                \"content\": \"$PROXY_IP\",
                \"ttl\": 300,
                \"proxied\": true
            }")
        ACTION="Updated"
    else
        # Create new record
        echo "   📝 Creating new DNS record..."
        RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{
                \"type\": \"A\",
                \"name\": \"$subdomain\",
                \"content\": \"$PROXY_IP\",
                \"ttl\": 300,
                \"proxied\": true
            }")
        ACTION="Created"
    fi
    
    # Check result
    SUCCESS=$(echo $RESULT | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        echo "   ✅ $ACTION DNS record for $FULL_DOMAIN → $PROXY_IP"
    else
        echo "   ❌ Failed to configure $FULL_DOMAIN"
        echo "   Error: $(echo $RESULT | jq -r '.errors[0].message // "Unknown error"')"
    fi
    echo ""
done

echo "🎉 DNS Configuration Complete!"
echo ""
echo "📋 Summary:"
echo "   All domains now point to NPM Proxy Server ($PROXY_IP):"
for subdomain in "${DOMAINS[@]}"; do
    echo "   ✅ $subdomain.$CLOUDFLARE_ZONE → $PROXY_IP"
done
echo ""
echo "🔍 Verify DNS propagation:"
for subdomain in "${DOMAINS[@]}"; do
    echo "   dig $subdomain.$CLOUDFLARE_ZONE"
done
echo ""
echo "🌐 Test the domains:"
for subdomain in "${DOMAINS[@]}"; do
    echo "   curl -v http://$subdomain.$CLOUDFLARE_ZONE"
done
echo ""
echo "⏱️  DNS changes may take 1-5 minutes to propagate globally"