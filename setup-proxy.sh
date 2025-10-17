#!/bin/bash

# Reverse Proxy Setup Script for 192.168.1.111
# This sets up nginx to proxy jeremy.devop.foo, portfolio.devop.foo, and jb.devop.foo to Kubernetes

echo "🌐 Setting up Reverse Proxy at 192.168.1.111"
echo "=============================================="

# Get Kubernetes ingress IP (you'll need to update this when cluster is ready)
K8S_INGRESS_IP="KUBERNETES_INGRESS_IP_HERE"  # Replace with actual ingress IP

# Create nginx configuration directory if it doesn't exist
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Create the reverse proxy configuration
sudo tee /etc/nginx/sites-available/portfolio-proxy > /dev/null << EOF
# Upstream backend pointing to Kubernetes ingress
upstream kubernetes_cluster {
    server $K8S_INGRESS_IP:80 max_fails=3 fail_timeout=30s;
    # Add more ingress IPs for load balancing if needed
    # server ANOTHER_K8S_INGRESS_IP:80 max_fails=3 fail_timeout=30s;
}

# HTTP server block
server {
    listen 80;
    listen [::]:80;
    server_name jeremy.devop.foo portfolio.devop.foo jb.devop.foo;

    # Logging
    access_log /var/log/nginx/portfolio_access.log;
    error_log /var/log/nginx/portfolio_error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

    # Real IP configuration for proper client IP forwarding
    real_ip_header X-Real-IP;
    real_ip_recursive on;
    set_real_ip_from 10.0.0.0/8;
    set_real_ip_from 172.16.0.0/12;
    set_real_ip_from 192.168.0.0/16;
    set_real_ip_from 127.0.0.0/8;

    # Main proxy configuration
    location / {
        proxy_pass http://kubernetes_cluster;
        
        # Host and forwarding headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;

        # WebSocket support for real-time features
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_next_upstream_timeout 60s;
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_temp_file_write_size 256k;
        
        # Retry logic
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }

    # Health check endpoint for this proxy
    location /proxy-health {
        access_log off;
        return 200 "nginx proxy healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Block sensitive files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# HTTPS configuration (uncomment after obtaining SSL certificates)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name jeremy.devop.foo portfolio.devop.foo jb.devop.foo;
#
#     # SSL certificate configuration
#     ssl_certificate /etc/ssl/certs/portfolio.crt;
#     ssl_certificate_key /etc/ssl/private/portfolio.key;
#
#     # SSL settings
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
#     ssl_prefer_server_ciphers off;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#
#     # Same location blocks as HTTP version
#     include /etc/nginx/sites-available/portfolio-proxy-locations;
# }
EOF

echo "✅ Created nginx configuration at /etc/nginx/sites-available/portfolio-proxy"

# Enable the site
if [ -L /etc/nginx/sites-enabled/portfolio-proxy ]; then
    echo "✅ Site already enabled"
else
    sudo ln -s /etc/nginx/sites-available/portfolio-proxy /etc/nginx/sites-enabled/
    echo "✅ Enabled portfolio-proxy site"
fi

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    if sudo systemctl reload nginx; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Failed to reload nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

echo ""
echo "🎉 Reverse Proxy Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. 🔧 Update the Kubernetes ingress IP in the configuration:"
echo "   Edit: /etc/nginx/sites-available/portfolio-proxy"
echo "   Replace: KUBERNETES_INGRESS_IP_HERE with actual K8s ingress IP"
echo ""
echo "2. 🌐 The following domains will proxy to Kubernetes:"
echo "   • jeremy.devop.foo"
echo "   • portfolio.devop.foo" 
echo "   • jb.devop.foo"
echo ""
echo "3. 🔍 Test the proxy:"
echo "   curl -H 'Host: jeremy.devop.foo' http://192.168.1.111/proxy-health"
echo ""
echo "4. 📊 Monitor logs:"
echo "   tail -f /var/log/nginx/portfolio_access.log"
echo "   tail -f /var/log/nginx/portfolio_error.log"
EOF