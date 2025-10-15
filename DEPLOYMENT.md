# Production Deployment Guide
## Jeremy Butler Portfolio - Kubernetes Deployment

This guide will deploy your portfolio to production Kubernetes with the domain `portfolio.devop.foo`.

## 🚀 Quick Deployment

### Prerequisites
- Kubernetes cluster with ingress controller (nginx recommended)
- kubectl configured and connected to your cluster
- Docker for building images
- Cloudflare account with API access
- cert-manager installed (optional, for automatic SSL)

### 1. Set Environment Variables

```bash
# Required: Cloudflare API Token
export CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"

# Optional: Container Registry (if using external registry)
export REGISTRY="your-registry.com"
```

Get your Cloudflare API token from: https://dash.cloudflare.com/profile/api-tokens

### 2. Deploy to Kubernetes

```bash
# Deploy the application
./deploy-k8s.sh
```

This script will:
- ✅ Build production Docker images
- ✅ Create Kubernetes namespace and resources
- ✅ Deploy backend (Node.js + WebSockets)
- ✅ Deploy frontend (React + Nginx)
- ✅ Configure ingress with SSL
- ✅ Wait for deployments to be ready

### 3. Configure Cloudflare DNS

```bash
# Automatically configure DNS
./configure-dns.sh
```

This will:
- ✅ Get the Kubernetes ingress IP
- ✅ Create/update DNS A record for portfolio.devop.foo
- ✅ Enable Cloudflare proxy (DDoS protection)
- ✅ Test DNS propagation

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n portfolio

# Check services
kubectl get services -n portfolio

# Check ingress
kubectl get ingress -n portfolio

# View logs
kubectl logs -f deployment/portfolio-backend -n portfolio
kubectl logs -f deployment/portfolio-frontend -n portfolio
```

### 5. Access Your Portfolio

🌐 **Your portfolio will be live at: https://portfolio.devop.foo**

## 📋 Manual Steps (if needed)

### Manual DNS Configuration

If the automated script doesn't work, manually add this record in Cloudflare:

```
Type: A
Name: portfolio
Value: [YOUR_INGRESS_IP]
Proxy: Enabled (orange cloud)
TTL: Auto
```

Get your ingress IP:
```bash
kubectl get ingress portfolio-ingress -n portfolio -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### Manual SSL Certificate

If cert-manager is not available, you can:

1. **Use Cloudflare SSL (Recommended):**
   - Enable "Full (strict)" SSL in Cloudflare dashboard
   - Cloudflare will handle SSL termination

2. **Manual Certificate:**
   - Create your own TLS secret
   - Update the ingress to reference your certificate

## 🛠 Architecture Overview

```
Internet → Cloudflare → K8s Ingress → Services → Pods

Portfolio Frontend (React + Nginx)
├── Deployment: 2 replicas
├── Service: ClusterIP on port 8080
└── Resources: 256Mi memory, 250m CPU

Portfolio Backend (Node.js + WebSockets)
├── Deployment: 2 replicas  
├── Service: ClusterIP on port 3001
├── WebSocket support for real-time features
└── Resources: 512Mi memory, 500m CPU

Ingress (nginx)
├── Routes: / → Frontend, /api → Backend, /socket.io → Backend
├── SSL termination
├── Rate limiting
└── Security headers
```

## 🔧 Customization

### Update Domain

To use a different domain, update these files:
- `k8s/00-namespace-config.yaml` - ConfigMaps
- `k8s/03-ingress.yaml` - Ingress host
- `k8s/04-ssl-certificate.yaml` - Certificate domain
- `configure-dns.sh` - Domain variables

### Container Registry

To use an external container registry:

1. Update `deploy-k8s.sh` with your registry URL
2. Push images to your registry
3. Update image pull secrets if needed

### Resource Limits

Adjust resources in deployment files:
- `k8s/01-backend-deployment.yaml`
- `k8s/02-frontend-deployment.yaml`

### Environment Variables

Update configurations in:
- `k8s/00-namespace-config.yaml`

## 🔍 Troubleshooting

### Deployment Issues

```bash
# Check deployment status
kubectl describe deployment portfolio-backend -n portfolio
kubectl describe deployment portfolio-frontend -n portfolio

# Check events
kubectl get events -n portfolio --sort-by=.metadata.creationTimestamp

# Check pod logs
kubectl logs deployment/portfolio-backend -n portfolio
kubectl logs deployment/portfolio-frontend -n portfolio
```

### DNS Issues

```bash
# Test DNS resolution
dig portfolio.devop.foo
nslookup portfolio.devop.foo

# Check Cloudflare DNS
curl -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### SSL Issues

```bash
# Check certificate status (if using cert-manager)
kubectl describe certificate portfolio-tls -n portfolio

# Check ingress TLS
kubectl describe ingress portfolio-ingress -n portfolio
```

### Ingress Issues

```bash
# Check ingress controller logs
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx

# Test backend connectivity
kubectl port-forward svc/portfolio-backend-service 3001:3001 -n portfolio
curl http://localhost:3001/health
```

## 🔄 Updates & Maintenance

### Deploy Updates

```bash
# Rebuild and redeploy
./deploy-k8s.sh

# Or manually:
docker compose -f docker-compose.prod.yml build
kubectl rollout restart deployment/portfolio-backend -n portfolio
kubectl rollout restart deployment/portfolio-frontend -n portfolio
```

### Monitor Resources

```bash
# Resource usage
kubectl top pods -n portfolio

# Scaling
kubectl scale deployment portfolio-backend --replicas=3 -n portfolio
kubectl scale deployment portfolio-frontend --replicas=3 -n portfolio
```

### Backup Configuration

```bash
# Export current configuration
kubectl get all -n portfolio -o yaml > portfolio-backup.yaml
```

## 🎯 Production Checklist

- ✅ SSL certificate configured
- ✅ DNS pointing to correct IP
- ✅ Ingress controller installed
- ✅ Resource limits configured
- ✅ Health checks working
- ✅ Monitoring setup
- ✅ Backup strategy in place
- ✅ Secrets properly secured

---

**🎉 Your professional DevOps portfolio is now live at https://portfolio.devop.foo!**