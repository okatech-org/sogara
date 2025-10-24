require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import des modules locaux
const logger = require('./utils/logger');
const { logRequest, logError } = require('./utils/logger');
const { sequelize, testConnection } = require('./config/database');

// Import des middlewares
const authMiddleware = require('./middleware/auth.middleware');
const uploadMiddleware = require('./middleware/upload.middleware');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const visitRoutes = require('./routes/visit.routes');
const packageRoutes = require('./routes/package.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const hseRoutes = require('./routes/hse.routes');
const postRoutes = require('./routes/post.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const approvalRoutes = require('./routes/approval.routes');

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration Socket.IO pour les notifications temps réel
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:5173"],
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

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ["http://localhost:5173"];
    
    // Autoriser les requêtes sans origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS: Origine non autorisée: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middlewares généraux
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ':' + (req.user?.id || 'anonymous');
  }
});

app.use('/api/', limiter);

// Middleware de logging des requêtes
app.use(logRequest);

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API SOGARA Access - Système de gestion intégré raffinerie',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test de connexion à la base de données
    await sequelize.authenticate();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        server: 'running'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        server: 'running'
      },
      error: error.message
    });
  }
});

// Configuration des routes API
app.use('/api/auth', authRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/visits', authMiddleware, visitRoutes);
app.use('/api/packages', authMiddleware, packageRoutes);
app.use('/api/equipment', authMiddleware, equipmentRoutes);
app.use('/api/hse', authMiddleware, hseRoutes);
app.use('/api/posts', authMiddleware, postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/approval', approvalRoutes);

// Stocker l'instance Socket.IO dans l'app pour les contrôleurs
app.set('io', io);

// Route pour les uploads
app.use('/api/upload', authMiddleware, uploadMiddleware);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Middleware de gestion des erreurs
app.use((error, req, res, next) => {
  logError(error, req, res, next);
  
  // Erreur de validation Joi
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  // Erreur Sequelize
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Conflit de données',
      error: 'Cette valeur existe déjà'
    });
  }
  
  // Erreur JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
  
  // Erreur de fichier trop volumineux
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Fichier trop volumineux'
    });
  }
  
  // Erreur générique
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erreur interne du serveur' 
    : error.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Configuration Socket.IO pour les notifications temps réel
io.on('connection', (socket) => {
  logger.info(`Nouvelle connexion Socket.IO: ${socket.id}`);
  
  socket.on('authenticate', (data) => {
    const { userId, token } = data;
    
    // Validation du token (simplifiée pour l'exemple)
    if (userId && token) {
      socket.userId = userId;
      global.socketConnections.set(userId, socket.id);
      logger.info(`Utilisateur ${userId} authentifié via Socket.IO`);
      
      socket.emit('authenticated', { success: true });
    } else {
      socket.emit('authentication_error', { message: 'Token invalide' });
    }
  });
  
  socket.on('disconnect', () => {
    if (socket.userId) {
      global.socketConnections.delete(socket.userId);
      logger.info(`Utilisateur ${socket.userId} déconnecté`);
    }
  });
  
  socket.on('error', (error) => {
    logger.error('Erreur Socket.IO:', error);
  });
});

// Fonction pour envoyer des notifications
global.sendNotification = (userId, notification) => {
  const socketId = global.socketConnections.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
};

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await testConnection();
    
    // Synchronisation des modèles (création des tables)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Base de données synchronisée');
    }
    
    const PORT = process.env.PORT || 3001;
    
    server.listen(PORT, () => {
      logger.info(`🚀 Serveur SOGARA API démarré sur le port ${PORT}`);
      logger.info(`🌍 Environnement: ${process.env.NODE_ENV}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔌 Socket.IO activé pour les notifications temps réel`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
      }
    });
    
    // Gestion des signaux de fermeture
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('❌ Erreur de démarrage du serveur:', error);
    process.exit(1);
  }
};

// Fermeture propre du serveur
const gracefulShutdown = async (signal) => {
  logger.info(`📥 Signal ${signal} reçu, fermeture du serveur...`);
  
  server.close(() => {
    logger.info('🔌 Serveur HTTP fermé');
    
    sequelize.close().then(() => {
      logger.info('🗃️ Connexion base de données fermée');
      process.exit(0);
    }).catch((error) => {
      logger.error('❌ Erreur fermeture base de données:', error);
      process.exit(1);
    });
  });
  
  // Force la fermeture après 10 secondes
  setTimeout(() => {
    logger.error('⚠️ Fermeture forcée du serveur');
    process.exit(1);
  }, 10000);
};

// Démarrage du serveur
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
