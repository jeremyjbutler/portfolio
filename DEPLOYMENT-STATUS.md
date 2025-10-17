# Deployment Instructions - README
# =====================================

## Current Status
✅ Development environment is running locally:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001  
   - Full Site: http://localhost

✅ Production Docker images are built:
   - portfolio-frontend:latest
   - portfolio-backend:latest

## Next Steps for Kubernetes Deployment

### 1. Wait for Kubernetes Cluster to be Online
```bash
# Test cluster connection
kubectl cluster-info

# Should show:
# Kubernetes control plane is running at https://192.168.1.123:6443
```

### 2. Deploy to Kubernetes
```bash
# Run the deployment script (with improved namespace handling)
./deploy-k8s.sh

# Or use the quick deploy (skips Docker build)
./quick-deploy.sh
```

### 3. Get Kubernetes Ingress IP
```bash
# After deployment, get the ingress IP
kubectl get ingress -n portfolio
kubectl get services -n portfolio

# Note the EXTERNAL-IP or ingress IP address
```

### 4. Set Up Reverse Proxy at 192.168.1.111

Option A: Use the automated script
```bash
# Copy setup-proxy.sh to 192.168.1.111
scp setup-proxy.sh user@192.168.1.111:~/

# SSH to 192.168.1.111 and run
ssh user@192.168.1.111
./setup-proxy.sh

# Edit the configuration to add the real K8s ingress IP
sudo nano /etc/nginx/sites-available/portfolio-proxy
# Replace: KUBERNETES_INGRESS_IP_HERE with actual IP
```

Option B: Manual nginx configuration
```bash
# SSH to 192.168.1.111
ssh user@192.168.1.111

# Edit nginx configuration
sudo nano /etc/nginx/sites-available/portfolio-proxy
# Add the configuration from nginx-proxy.conf

# Enable and test
sudo ln -s /etc/nginx/sites-available/portfolio-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Update DNS Records

The configure-dns.sh script will point these domains to 192.168.1.111:
- jeremy.devop.foo
- portfolio.devop.foo  
- jb.devop.foo

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your_token"
export DOMAIN="jeremy.devop.foo"  # or portfolio.devop.foo, jb.devop.foo

# Run DNS configuration (update to point to 192.168.1.111)
./configure-dns.sh
```

### 6. Test the Full Setup
```bash
# Test domains resolve to proxy server
nslookup jeremy.devop.foo
nslookup portfolio.devop.foo
nslookup jb.devop.foo

# Test the proxy
curl -v http://jeremy.devop.foo
curl -v http://portfolio.devop.foo
curl -v http://jb.devop.foo
```

## Architecture Overview
```
Internet
    ↓
Cloudflare DNS (jeremy.devop.foo, portfolio.devop.foo, jb.devop.foo)
    ↓
192.168.1.111 (NPM Reverse Proxy Server)
    ↓
Kubernetes Cluster (192.168.1.123)
    ↓ 
Portfolio Application (Frontend + Backend + WebSocket)
```

## NPM Proxy Configuration
The deployment now automatically configures the NPM (Nginx Proxy Manager) server at 192.168.1.111:
- SSH access with credentials from ~/.env
- API-based proxy host creation/updates
- WebSocket support for real-time features
- Multiple domain handling (jeremy/portfolio/jb.devop.foo)

## Troubleshooting

### If Kubernetes deployment fails:
```bash
# Check pod status
kubectl get pods -n portfolio

# Check logs
kubectl logs -f deployment/portfolio-frontend -n portfolio
kubectl logs -f deployment/portfolio-backend -n portfolio

# Restart deployment
kubectl rollout restart deployment/portfolio-frontend -n portfolio
kubectl rollout restart deployment/portfolio-backend -n portfolio
```

### If nginx proxy fails:
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/portfolio_error.log

# Test configuration
sudo nginx -t
```

### If DNS doesn't resolve:
```bash
# Check Cloudflare DNS records
dig jeremy.devop.foo
dig portfolio.devop.foo  
dig jb.devop.foo

# Should point to 192.168.1.111
```