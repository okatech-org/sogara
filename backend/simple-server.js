require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration Socket.IO pour les notifications temps réel
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Stockage des connexions Socket.IO
global.socketConnections = new Map();

// Configuration des middlewares de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});

app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes API mockées
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      kpis: [
        { label: 'Visiteurs aujourd\'hui', value: 12, trend: { changePercent: 8.5 } },
        { label: 'Colis en attente', value: 5, trend: { changePercent: -12.3 } },
        { label: 'Incidents HSE', value: 2, trend: { changePercent: -25.0 } },
        { label: 'Formations complétées', value: 18, trend: { changePercent: 15.2 } }
      ],
      charts: {
        visitors: { labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], data: [8, 12, 15, 10, 14] },
        incidents: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'], data: [3, 2, 4, 1, 2] }
      }
    }
  });
});

app.get('/api/approval/workflows', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Validation HSE',
        description: 'Workflow de validation des incidents HSE',
        steps: [
          { id: '1', name: 'Signalement', status: 'completed', assignee: 'HSE001' },
          { id: '2', name: 'Analyse', status: 'in_progress', assignee: 'HSE001' },
          { id: '3', name: 'Validation', status: 'pending', assignee: 'DG001' }
        ],
        status: 'in_progress',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/approval/pending', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        workflowId: '1',
        stepName: 'Analyse HSE',
        assignee: 'HSE001',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        description: 'Analyser l\'incident HSE signalé'
      }
    ]
  });
});

// Route pour les posts (mock)
app.get('/api/posts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Bienvenue sur SOGARA Connect',
        content: 'Système de gestion intégré pour la raffinerie',
        author: 'Admin',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Serveur SOGARA démarré sur le port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS autorisé pour: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
  process.exit(1);
});