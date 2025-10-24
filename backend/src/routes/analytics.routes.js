const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Routes analytics
router.get('/dashboard', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), analyticsController.getDashboardMetrics);
router.get('/hse', requireRole(['ADMIN', 'HSE']), analyticsController.getHSEAnalytics);
router.get('/realtime', requireRole(['ADMIN', 'HSE', 'SUPERVISEUR']), analyticsController.getRealTimeMetrics);
router.post('/metric', requireRole(['ADMIN', 'HSE']), analyticsController.createMetric);

module.exports = router;
