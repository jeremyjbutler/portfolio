# Jeremy Butler - DevOps Engineer Portfolio

A modern, high-tech portfolio website showcasing DevOps engineering expertise, built with React, Node.js, and WebSockets.

## 🚀 Quick Start (Development)

### Prerequisites
- Docker & Docker Compose
- Git

### Setup & Run
```bash
# Clone and enter the project
git clone <repository-url>
cd portfolio

# Start the development environment
./start-dev.sh
```

That's it! Your portfolio will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Full Site**: http://localhost (via Nginx)

## 🛠 Development Environment

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  React Frontend  │    │ Node.js Backend │
│   Port: 80      │◄──►│   Port: 3000     │◄──►│   Port: 5000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Services
- **Frontend**: React 18 with modern hooks, Framer Motion animations
- **Backend**: Node.js/Express with Socket.IO for real-time features  
- **Nginx**: Development proxy for seamless integration
- **WebSockets**: Real-time visitor analytics and interactions

### Hot Reloading
Both frontend and backend support hot reloading:
- React changes reload instantly
- Node.js server restarts on file changes
- No need to rebuild containers during development

## 🔧 Development Commands

```bash
# View all service logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Restart services
docker-compose -f docker-compose.dev.yml restart

# Check running services
docker-compose -f docker-compose.dev.yml ps

# Rebuild containers (after dependency changes)
docker-compose -f docker-compose.dev.yml build
```

## 🌟 Features

### Frontend (React)
- **Modern UI**: Gradient backgrounds, glassmorphism effects, cyber-tech theme
- **Animations**: Smooth Framer Motion animations and transitions  
- **Interactive Skills**: Filterable skill tags with detailed descriptions
- **Responsive Design**: Mobile-first approach with fluid layouts
- **Real-time Updates**: WebSocket integration for live features

### Backend (Node.js)
- **RESTful API**: Clean API endpoints for portfolio data
- **WebSocket Server**: Real-time visitor analytics and interactions
- **Security**: Helmet.js, rate limiting, CORS configuration
- **Logging**: Winston logging with file and console outputs
- **Health Monitoring**: Built-in health check endpoints

### Infrastructure Features
- **Containerized**: Full Docker setup for consistent environments
- **Proxy Setup**: Nginx configuration for production-like routing
- **Environment Config**: Separate dev/prod environment management
- **Volume Mounts**: Live code editing without rebuilds

## 📁 Project Structure

```
portfolio/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.js          # Main application
│   ├── public/             # Static assets
│   └── Dockerfile.dev      # Frontend development container
├── backend/                # Node.js server
│   ├── server.js           # Express server with Socket.IO
│   ├── logs/               # Application logs
│   └── Dockerfile.dev      # Backend development container
├── nginx/                  # Nginx configuration
│   └── nginx.dev.conf      # Development proxy config
├── k8s/                    # Kubernetes manifests (for production)
├── docker-compose.dev.yml  # Development orchestration
└── start-dev.sh           # Development setup script
```

## 🎯 Key Technologies

### DevOps & Infrastructure
- **Containers**: Docker, Kubernetes
- **Orchestration**: Docker Compose, Kubernetes manifests
- **Proxy**: Nginx with WebSocket support
- **CI/CD**: Ready for GitLab CI/CD, GitHub Actions

### Frontend Stack
- **React 18**: Modern hooks, functional components
- **Framer Motion**: Advanced animations and transitions
- **Styled Components**: CSS-in-JS styling
- **Socket.IO Client**: Real-time WebSocket communication
- **Intersection Observer**: Scroll-triggered animations

### Backend Stack  
- **Node.js/Express**: RESTful API server
- **Socket.IO**: WebSocket server for real-time features
- **Winston**: Structured logging
- **Helmet.js**: Security middleware
- **Rate Limiting**: API protection

## 🔒 Security Features

- **Content Security Policy**: Helmet.js security headers
- **Rate Limiting**: API endpoint protection  
- **CORS**: Controlled cross-origin requests
- **Input Validation**: Request sanitization
- **Error Handling**: Secure error responses

## 📊 Real-time Features

- **Visitor Analytics**: Live visitor count and page views
- **Skill Interactions**: Real-time skill popularity tracking
- **Project Views**: Live project engagement metrics
- **Contact Form**: Instant form submission feedback
- **Connection Status**: WebSocket connection indicator

## 🚀 Deployment Ready

The portfolio is designed for easy deployment to:
- **Kubernetes**: Complete K8s manifests included
- **Docker Swarm**: Docker Compose production setup
- **Cloud Platforms**: AWS, Azure, GCP compatible
- **CDN Integration**: Ready for CloudFlare, AWS CloudFront

## 🔗 Domain Configuration

For custom domain setup (jeremy.devop.foo):
1. Update DNS records to point to your server
2. Configure SSL certificates
3. Update environment variables
4. Deploy with production Docker Compose

## 📝 Environment Variables

> ⚠️ **Security Note**: Never commit actual credentials to the repository. Use `.env.example` as a template.

### Quick Setup
```bash
# Copy example environment file
cp .env.example ~/.env

# Edit with your actual values  
nano ~/.env

# Source the environment
source ~/.env
```

### Frontend (.env)
```env
REACT_APP_WEBSOCKET_URL=ws://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SITE_URL=http://localhost:3000
```

### Backend (.env) 
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secure-jwt-secret-here
```

### Production Deployment (.env)
```env
# Required for Cloudflare DNS automation
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE=your-domain.com

# Required for secure JWT signing
JWT_SECRET=your_production_jwt_secret

# Domain and contact configuration
DOMAIN=portfolio.your-domain.com
EMAIL=your-email@your-domain.com
REACT_APP_CONTACT_EMAIL=your-email@your-domain.com

# Optional: External container registry
REGISTRY=your-registry.com
```

### Getting Your Cloudflare API Token
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create a new token with:
   - Zone:Zone:Read permissions
   - Zone:DNS:Edit permissions  
   - Include all zones (or specify devop.foo)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `./start-dev.sh`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by Jeremy Butler**  
*DevOps Engineer | Software Developer | Cloud Architect*

📧 Contact via portfolio  
🌐 Deploy to your domain  
💼 LinkedIn | 🐙 GitHub