const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const Employee = require('../models/Employee.model');
const logger = require('../utils/logger');
const { authSchema } = require('../utils/validators');

// Stockage des refresh tokens (en production, utiliser Redis)
const refreshTokens = new Map();

/**
 * Connexion utilisateur
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { error, value } = authSchema.login.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    const { matricule, password } = value;
    
    // Recherche de l'employé
    const employee = await Employee.findActiveByMatricule(matricule);
    
    if (!employee) {
      logger.warn(`Tentative de connexion avec matricule inexistant: ${matricule}`);
      return res.status(401).json({
        success: false,
        message: 'Matricule ou mot de passe incorrect'
      });
    }
    
    // Vérification du mot de passe
    if (!employee.password) {
      logger.warn(`Tentative de connexion sur compte sans mot de passe: ${matricule}`);
      return res.status(401).json({
        success: false,
        message: 'Compte non activé. Contactez l\'administrateur.'
      });
    }
    
    const isPasswordValid = await employee.validatePassword(password);
    
    if (!isPasswordValid) {
      logger.warn(`Tentative de connexion avec mot de passe incorrect: ${matricule}`);
      return res.status(401).json({
        success: false,
        message: 'Matricule ou mot de passe incorrect'
      });
    }
    
    // Génération des tokens
    const tokenPayload = {
      userId: employee.id,
      matricule: employee.matricule,
      roles: employee.roles
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Stockage du refresh token
    refreshTokens.set(employee.id, refreshToken);
    
    // Mise à jour de la dernière connexion
    await employee.update({ lastLoginAt: new Date() });
    
    // Envoi de notification de connexion si Socket.IO disponible
    if (global.sendNotification) {
      global.sendNotification(employee.id, {
        type: 'info',
        title: 'Connexion réussie',
        message: `Bienvenue ${employee.getFullName()}`,
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info(`Connexion réussie: ${matricule} (${employee.roles.join(', ')})`);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: employee.toSafeJSON(),
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });
    
  } catch (error) {
    logger.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Inscription d'un nouvel employé (admin seulement)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { error, value } = authSchema.register.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    const {
      firstName,
      lastName,
      matricule,
      service,
      roles,
      competences,
      habilitations,
      email,
      phone,
      password
    } = value;
    
    // Vérification que le matricule n'existe pas déjà
    const existingEmployee = await Employee.findByMatricule(matricule);
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'Ce matricule existe déjà'
      });
    }
    
    // Vérification que l'email n'existe pas déjà (si fourni)
    if (email) {
      const existingEmail = await Employee.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        });
      }
    }
    
    // Création de l'employé
    const employee = await Employee.create({
      firstName,
      lastName,
      matricule,
      service,
      roles,
      competences: competences || [],
      habilitations: habilitations || [],
      email,
      phone,
      password,
      status: 'active'
    });
    
    logger.info(`Nouvel employé créé: ${matricule} par ${req.user?.matricule || 'system'}`);
    
    res.status(201).json({
      success: true,
      message: 'Employé créé avec succès',
      data: {
        user: employee.toSafeJSON()
      }
    });
    
  } catch (error) {
    logger.error('Erreur lors de l\'inscription:', error);
    
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
        error: 'Une valeur unique existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Renouvellement du token d'accès
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Token de renouvellement requis'
      });
    }
    
    // Vérification du refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Vérification que le token existe en mémoire
    const storedToken = refreshTokens.get(decoded.userId);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de renouvellement invalide'
      });
    }
    
    // Vérification que l'utilisateur existe toujours
    const employee = await Employee.findByPk(decoded.userId);
    if (!employee || employee.status !== 'active') {
      refreshTokens.delete(decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif'
      });
    }
    
    // Génération d'un nouveau token d'accès
    const newAccessToken = generateAccessToken({
      userId: employee.id,
      matricule: employee.matricule,
      roles: employee.roles
    });
    
    logger.debug(`Token renouvelé pour: ${employee.matricule}`);
    
    res.json({
      success: true,
      message: 'Token renouvelé',
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });
    
  } catch (error) {
    logger.error('Erreur renouvellement token:', error);
    
    if (error.message === 'Token refresh expiré' || error.message === 'Token refresh invalide') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Déconnexion utilisateur
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Suppression du refresh token
      refreshTokens.delete(userId);
      
      // Notification de déconnexion
      if (global.sendNotification) {
        global.sendNotification(userId, {
          type: 'info',
          title: 'Déconnexion',
          message: 'Vous avez été déconnecté avec succès',
          timestamp: new Date().toISOString()
        });
      }
      
      logger.info(`Déconnexion: ${req.user.matricule}`);
    }
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    logger.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Changement de mot de passe
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { error, value } = authSchema.changePassword.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    const { currentPassword, newPassword } = value;
    const userId = req.user.id;
    
    // Récupération de l'employé avec mot de passe
    const employee = await Employee.findByPk(userId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérification du mot de passe actuel
    if (!employee.password) {
      return res.status(400).json({
        success: false,
        message: 'Aucun mot de passe défini pour ce compte'
      });
    }
    
    const isCurrentPasswordValid = await employee.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    // Mise à jour du mot de passe
    await employee.update({ password: newPassword });
    
    // Invalidation de tous les refresh tokens
    refreshTokens.delete(userId);
    
    logger.info(`Mot de passe changé pour: ${employee.matricule}`);
    
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
    
  } catch (error) {
    logger.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Validation du token actuel
 * GET /api/auth/validate
 */
const validateToken = async (req, res) => {
  try {
    // Le middleware d'authentification a déjà validé le token
    // et chargé les informations utilisateur
    
    res.json({
      success: true,
      message: 'Token valide',
      data: {
        user: req.user,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Erreur validation token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Obtenir les informations du profil utilisateur
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.user.id, {
      include: [
        {
          association: 'assignedEquipment',
          attributes: ['id', 'label', 'type', 'status']
        }
      ]
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Profil utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Profil récupéré',
      data: {
        user: employee.toSafeJSON()
      }
    });
    
  } catch (error) {
    logger.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  changePassword,
  validateToken,
  getProfile
};
