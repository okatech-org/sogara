const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByRole,
  getEmployeeStats,
  uploadProfilePhoto
} = require('../controllers/employee.controller');

const { requireRoles, requirePermissions, requireSelfOrAdmin } = require('../middleware/auth.middleware');
const { uploadProfilePhoto: uploadMiddleware, processUpload } = require('../middleware/upload.middleware');
const { validate, validateParams } = require('../utils/validators');
const { employeeSchema, schemas } = require('../utils/validators');

/**
 * @route   GET /api/employees
 * @desc    Obtenir tous les employés avec pagination et filtres
 * @access  Private (Admin, HSE, Superviseur)
 */
router.get('/', 
  requirePermissions('read:employees'),
  getEmployees
);

/**
 * @route   GET /api/employees/stats
 * @desc    Obtenir les statistiques des employés
 * @access  Private (Admin, HSE, Superviseur)
 */
router.get('/stats', 
  requirePermissions('read:employees'),
  getEmployeeStats
);

/**
 * @route   GET /api/employees/by-role/:role
 * @desc    Obtenir les employés par rôle
 * @access  Private (Admin, HSE, Superviseur)
 */
router.get('/by-role/:role',
  requirePermissions('read:employees'),
  getEmployeesByRole
);

/**
 * @route   GET /api/employees/:id
 * @desc    Obtenir un employé par ID
 * @access  Private (Admin, HSE, Superviseur ou utilisateur lui-même)
 */
router.get('/:id',
  validateParams({ id: schemas.id }),
  requireSelfOrAdmin,
  getEmployeeById
);

/**
 * @route   POST /api/employees
 * @desc    Créer un nouvel employé
 * @access  Private (Admin, HSE)
 */
router.post('/',
  requirePermissions('write:employees'),
  validate(employeeSchema.create),
  createEmployee
);

/**
 * @route   PUT /api/employees/:id
 * @desc    Mettre à jour un employé
 * @access  Private (Admin, HSE ou utilisateur lui-même pour certains champs)
 */
router.put('/:id',
  validateParams({ id: schemas.id }),
  validate(employeeSchema.update),
  requireSelfOrAdmin,
  updateEmployee
);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Supprimer (désactiver) un employé
 * @access  Private (Admin seulement)
 */
router.delete('/:id',
  validateParams({ id: schemas.id }),
  requireRoles('ADMIN'),
  deleteEmployee
);

/**
 * @route   POST /api/employees/:id/photo
 * @desc    Upload photo de profil
 * @access  Private (Admin ou utilisateur lui-même)
 */
router.post('/:id/photo',
  validateParams({ id: schemas.id }),
  requireSelfOrAdmin,
  uploadMiddleware,
  processUpload,
  uploadProfilePhoto
);

module.exports = router;
