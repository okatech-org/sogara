const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  getTrainings,
  createTraining,
  getHSEStats
} = require('../controllers/hse.controller');

// Import des middlewares
const { requirePermissions } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/hse/incidents
 * @desc    Obtenir tous les incidents HSE
 * @access  Private (Admin, HSE)
 */
router.get('/incidents', 
  requirePermissions('read:hse'),
  getIncidents
);

/**
 * @route   POST /api/hse/incidents
 * @desc    Créer un nouvel incident HSE
 * @access  Private (Admin, HSE, Employee)
 */
router.post('/incidents',
  requirePermissions('write:hse'),
  createIncident
);

/**
 * @route   PUT /api/hse/incidents/:id/status
 * @desc    Mettre à jour le statut d'un incident
 * @access  Private (Admin, HSE)
 */
router.put('/incidents/:id/status',
  requirePermissions('write:hse'),
  updateIncidentStatus
);

/**
 * @route   GET /api/hse/trainings
 * @desc    Obtenir toutes les formations HSE
 * @access  Private (Admin, HSE)
 */
router.get('/trainings',
  requirePermissions('read:hse'),
  getTrainings
);

/**
 * @route   POST /api/hse/trainings
 * @desc    Créer une nouvelle formation HSE
 * @access  Private (Admin, HSE)
 */
router.post('/trainings',
  requirePermissions('write:hse'),
  createTraining
);

/**
 * @route   GET /api/hse/stats/overview
 * @desc    Obtenir les statistiques HSE
 * @access  Private (Admin, HSE)
 */
router.get('/stats/overview',
  requirePermissions('read:hse'),
  getHSEStats
);

module.exports = router;