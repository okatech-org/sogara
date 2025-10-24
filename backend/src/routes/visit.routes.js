const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  getVisits,
  getVisitById,
  createVisit,
  checkinVisitor,
  checkoutVisitor,
  getTodaysVisits,
  getVisitStats
} = require('../controllers/visit.controller');

// Import des middlewares
const { requirePermissions } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validators');

/**
 * @route   GET /api/visits
 * @desc    Obtenir toutes les visites avec filtres
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/', 
  requirePermissions('read:visits'),
  getVisits
);

/**
 * @route   GET /api/visits/today/list
 * @desc    Obtenir les visites du jour
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/today/list',
  requirePermissions('read:visits'),
  getTodaysVisits
);

/**
 * @route   GET /api/visits/stats/overview
 * @desc    Obtenir les statistiques des visites
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/stats/overview',
  requirePermissions('read:visits'),
  getVisitStats
);

/**
 * @route   GET /api/visits/:id
 * @desc    Obtenir une visite par ID
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/:id',
  requirePermissions('read:visits'),
  getVisitById
);

/**
 * @route   POST /api/visits
 * @desc    Créer une nouvelle visite
 * @access  Private (Admin, HSE, Reception)
 */
router.post('/',
  requirePermissions('write:visits'),
  createVisit
);

/**
 * @route   POST /api/visits/:id/checkin
 * @desc    Check-in d'un visiteur
 * @access  Private (Admin, HSE, Reception)
 */
router.post('/:id/checkin',
  requirePermissions('write:visits'),
  checkinVisitor
);

/**
 * @route   POST /api/visits/:id/checkout
 * @desc    Check-out d'un visiteur
 * @access  Private (Admin, HSE, Reception)
 */
router.post('/:id/checkout',
  requirePermissions('write:visits'),
  checkoutVisitor
);

module.exports = router;