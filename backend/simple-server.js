require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Serveur SOGARA opérationnel',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API SOGARA - Serveur de développement',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Routes API mockées
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API accessible',
    data: {
      status: 'OK',
      timestamp: new Date().toISOString()
    }
  });
});

// Route pour les employés (mock)
app.get('/api/employees', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des employés',
    data: [
      { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@sogara.com' },
      { id: 2, firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@sogara.com' }
    ]
  });
});

// Route pour les visites (mock)
app.get('/api/visits', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des visites',
    data: []
  });
});

// Route pour les colis (mock)
app.get('/api/packages', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des colis',
    data: []
  });
});

// Route pour les équipements (mock)
app.get('/api/equipment', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des équipements',
    data: []
  });
});

// Route pour les incidents HSE (mock)
app.get('/api/hse/incidents', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des incidents HSE',
    data: []
  });
});

// Route pour les formations HSE (mock)
app.get('/api/hse/trainings', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des formations HSE',
    data: []
  });
});

// Route pour les posts (mock)
app.get('/api/posts', (req, res) => {
  res.json({
    success: true,
    message: 'Liste des posts',
    data: []
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur SOGARA démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS autorisé depuis: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
});

module.exports = app;
