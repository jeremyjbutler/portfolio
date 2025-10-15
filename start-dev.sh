#!/bin/bash

echo "🚀 Setting up Jeremy Butler's Portfolio Development Environment"
echo "=============================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available (built-in or standalone)
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose is not available. Please install Docker with Compose support."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed ($COMPOSE_CMD)"

# Create environment files if they don't exist
if [ ! -f "./backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cat > ./backend/.env << EOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Add your credentials here
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=

# Analytics (optional)
# GOOGLE_ANALYTICS_ID=

# Security (Generate a secure JWT secret for production)
JWT_SECRET=dev-jwt-secret-please-change-for-production
EOF
fi

if [ ! -f "./frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cat > ./frontend/.env << EOF
REACT_APP_WEBSOCKET_URL=ws://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_URL=http://localhost:3000
GENERATE_SOURCEMAP=true
EOF
fi

echo "🏗️  Building Docker containers..."
$COMPOSE_CMD -f docker-compose.dev.yml build

echo "🎯 Starting development environment..."
$COMPOSE_CMD -f docker-compose.dev.yml up -d

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📋 Available services:"
echo "   • Frontend (React):     http://localhost:3000"
echo "   • Backend (Node.js):    http://localhost:3001"
echo "   • Full Site (Nginx):    http://localhost"
echo "   • Health Check:         http://localhost:3001/health"
echo "   • API Endpoint:         http://localhost:3001/api"
echo ""
echo "🔧 Development commands:"
echo "   • View logs:            $COMPOSE_CMD -f docker-compose.dev.yml logs -f"
echo "   • Stop services:        $COMPOSE_CMD -f docker-compose.dev.yml down"
echo "   • Restart services:     $COMPOSE_CMD -f docker-compose.dev.yml restart"
echo "   • View running:         $COMPOSE_CMD -f docker-compose.dev.yml ps"
echo ""
echo "📁 Code changes will automatically reload thanks to volume mounts!"
echo ""
echo "🌐 To access via jeremy.devop.foo:"
echo "   Add this line to your /etc/hosts file:"
echo "   127.0.0.1 jeremy.devop.foo"
echo ""

# Wait a moment for services to start
sleep 5

# Check if services are running
echo "🔍 Checking service health..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend might still be starting up..."
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "⚠️  Frontend might still be starting up..."
fi

echo ""
echo "🎯 Happy coding! Your portfolio is live at http://localhost:3000"