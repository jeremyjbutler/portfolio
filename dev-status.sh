#!/bin/bash

echo "🔍 Portfolio Development Environment Status"
echo "=========================================="

# Determine Docker Compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose not found"
    exit 1
fi

# Check if Docker containers are running
if $COMPOSE_CMD -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Docker containers are running"
    
    echo ""
    echo "📊 Service Status:"
    $COMPOSE_CMD -f docker-compose.dev.yml ps
    
    echo ""
    echo "🌐 Endpoint Health Checks:"
    
    # Check backend health
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ Backend API (http://localhost:3001) - Healthy"
    else
        echo "❌ Backend API (http://localhost:3001) - Not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend (http://localhost:3000) - Running"
    else
        echo "❌ Frontend (http://localhost:3000) - Not responding"
    fi
    
    # Check nginx proxy
    if curl -s http://localhost > /dev/null; then
        echo "✅ Nginx Proxy (http://localhost) - Running"
    else
        echo "❌ Nginx Proxy (http://localhost) - Not responding"
    fi
    
    echo ""
    echo "📋 Quick Links:"
    echo "   • Portfolio Site:    http://localhost:3000"
    echo "   • API Health:        http://localhost:3001/health"
    echo "   • Full Site (Proxy): http://localhost"
    echo "   • WebSocket Test:    ws://localhost:3001"
    
else
    echo "❌ No containers running"
    echo ""
    echo "🚀 To start the development environment:"
    echo "   ./start-dev.sh"
    echo ""
    echo "🔧 To check what happened:"
    echo "   $COMPOSE_CMD -f docker-compose.dev.yml logs"
fi

echo ""
echo "🛠️  Useful Commands:"
echo "   • View logs:     $COMPOSE_CMD -f docker-compose.dev.yml logs -f"
echo "   • Stop all:      $COMPOSE_CMD -f docker-compose.dev.yml down"
echo "   • Restart:       $COMPOSE_CMD -f docker-compose.dev.yml restart"