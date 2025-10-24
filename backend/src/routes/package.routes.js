const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  getPackages,
  getPackageById,
  createPackage,
  markAsDelivered,
  getTodaysPackages,
  getPackageStats
} = require('../controllers/package.controller');

// Import des middlewares
const { requirePermissions } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/packages
 * @desc    Obtenir tous les colis avec filtres
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/', 
  requirePermissions('read:packages'),
  getPackages
);

/**
 * @route   GET /api/packages/today/list
 * @desc    Obtenir les colis du jour
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/today/list',
  requirePermissions('read:packages'),
  getTodaysPackages
);

/**
 * @route   GET /api/packages/stats/overview
 * @desc    Obtenir les statistiques des colis
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/stats/overview',
  requirePermissions('read:packages'),
  getPackageStats
);

/**
 * @route   GET /api/packages/:id
 * @desc    Obtenir un colis par ID
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/:id',
  requirePermissions('read:packages'),
  getPackageById
);

/**
 * @route   POST /api/packages
 * @desc    Créer un nouveau colis
 * @access  Private (Admin, HSE, Reception)
 */
router.post('/',
  requirePermissions('write:packages'),
  createPackage
);

/**
 * @route   POST /api/packages/:id/deliver
 * @desc    Marquer un colis comme livré
 * @access  Private (Admin, HSE, Reception)
 */
router.post('/:id/deliver',
  requirePermissions('write:packages'),
  markAsDelivered
);

module.exports = router;