const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  assignEquipment,
  returnEquipment,
  getEquipmentStats
} = require('../controllers/equipment.controller');

// Import des middlewares
const { requirePermissions } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/equipment
 * @desc    Obtenir tous les équipements avec filtres
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/', 
  requirePermissions('read:equipment'),
  getEquipment
);

/**
 * @route   GET /api/equipment/stats/overview
 * @desc    Obtenir les statistiques des équipements
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/stats/overview',
  requirePermissions('read:equipment'),
  getEquipmentStats
);

/**
 * @route   GET /api/equipment/:id
 * @desc    Obtenir un équipement par ID
 * @access  Private (Admin, HSE, Reception)
 */
router.get('/:id',
  requirePermissions('read:equipment'),
  getEquipmentById
);

/**
 * @route   POST /api/equipment
 * @desc    Créer un nouvel équipement
 * @access  Private (Admin, HSE)
 */
router.post('/',
  requirePermissions('write:equipment'),
  createEquipment
);

/**
 * @route   POST /api/equipment/:id/assign
 * @desc    Assigner un équipement à un employé
 * @access  Private (Admin, HSE)
 */
router.post('/:id/assign',
  requirePermissions('write:equipment'),
  assignEquipment
);

/**
 * @route   POST /api/equipment/:id/return
 * @desc    Retourner un équipement
 * @access  Private (Admin, HSE)
 */
router.post('/:id/return',
  requirePermissions('write:equipment'),
  returnEquipment
);

module.exports = router;