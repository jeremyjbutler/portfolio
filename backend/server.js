const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'portfolio-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Analytics storage (in production, use a database)
const analytics = {
  pageViews: [],
  visitors: new Set(),
  realTimeUsers: 0
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  analytics.realTimeUsers++;
  logger.info(`User connected: ${socket.id}, Total users: ${analytics.realTimeUsers}`);

  // Broadcast real-time user count
  io.emit('user_count', { count: analytics.realTimeUsers });

  // Handle page views
  socket.on('page_view', (data) => {
    const pageView = {
      id: socket.id,
      page: data.page,
      timestamp: new Date().toISOString(),
      userAgent: data.userAgent,
      ip: socket.handshake.address
    };
    
    analytics.pageViews.push(pageView);
    analytics.visitors.add(socket.handshake.address);
    
    logger.info(`Page view: ${data.page} from ${socket.id}`);
    
    // Send analytics update to all clients
    io.emit('visitor_analytics', {
      totalPageViews: analytics.pageViews.length,
      uniqueVisitors: analytics.visitors.size,
      realtimeUsers: analytics.realTimeUsers,
      recentPageViews: analytics.pageViews.slice(-10)
    });
  });

  // Handle skill interactions
  socket.on('skill_interaction', (data) => {
    logger.info(`Skill interaction: ${data.skill} by ${socket.id}`);
    
    // Broadcast skill popularity
    socket.broadcast.emit('skill_popular', {
      skill: data.skill,
      timestamp: new Date().toISOString()
    });
  });

  // Handle project views
  socket.on('project_view', (data) => {
    logger.info(`Project viewed: ${data.project} by ${socket.id}`);
    
    socket.broadcast.emit('project_activity', {
      project: data.project,
      timestamp: new Date().toISOString()
    });
  });

  // Handle contact form submissions
  socket.on('contact_form', (data) => {
    logger.info(`Contact form submission from ${socket.id}`);
    
    // In production, save to database and send email
    socket.emit('contact_response', {
      status: 'received',
      message: 'Thank you for your message! I\'ll get back to you soon.',
      timestamp: new Date().toISOString()
    });
  });

  // Send portfolio updates
  socket.on('request_portfolio_update', () => {
    socket.emit('portfolio_update', {
      type: 'skills_update',
      data: {
        newSkills: ['Odoo 17', 'Advanced Kubernetes', 'ML Pipeline Optimization'],
        updatedAt: new Date().toISOString()
      }
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    analytics.realTimeUsers--;
    logger.info(`User disconnected: ${socket.id}, Total users: ${analytics.realTimeUsers}`);
    
    // Broadcast updated user count
    io.emit('user_count', { count: analytics.realTimeUsers });
  });
});

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/analytics', (req, res) => {
  res.json({
    totalPageViews: analytics.pageViews.length,
    uniqueVisitors: analytics.visitors.size,
    realtimeUsers: analytics.realTimeUsers,
    recentActivity: analytics.pageViews.slice(-20)
  });
});

app.get('/api/portfolio/skills', (req, res) => {
  res.json({
    categories: [
      'DevOps & Infrastructure',
      'Cloud Platforms',
      'Programming Languages',
      'Python Libraries & Frameworks',
      'ERP & Business Systems',
      'Databases & Storage',
      'System Administration',
      'Monitoring & Security',
      'Web Development'
    ],
    lastUpdated: new Date().toISOString()
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  logger.info(`Contact form submission: ${name} <${email}>`);
  
  // In production, validate input, save to database, and send email
  res.json({
    status: 'success',
    message: 'Thank you for your message! I\'ll get back to you soon.',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Portfolio backend server running on port ${PORT}`);
  logger.info(`WebSocket server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});