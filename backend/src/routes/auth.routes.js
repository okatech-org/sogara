const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const {
  login,
  register,
  refreshToken,
  logout,
  changePassword,
  validateToken,
  getProfile
} = require('../controllers/auth.controller');

const { authMiddleware, requireRoles } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validators');
const { authSchema } = require('../utils/validators');

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
router.post('/login', validate(authSchema.login), login);

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel employé (admin seulement)
 * @access  Private (Admin only)
 */
router.post('/register', 
  authMiddleware,
  requireRoles('ADMIN'),
  validate(authSchema.register),
  register
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renouvellement du token d'accès
 * @access  Public (avec refresh token)
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion utilisateur
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Changement de mot de passe
 * @access  Private
 */
router.post('/change-password',
  authMiddleware,
  validate(authSchema.changePassword),
  changePassword
);

/**
 * @route   GET /api/auth/validate
 * @desc    Validation du token actuel
 * @access  Private
 */
router.get('/validate', authMiddleware, validateToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir les informations du profil utilisateur
 * @access  Private
 */
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
