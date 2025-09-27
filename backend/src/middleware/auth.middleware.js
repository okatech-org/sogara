const { verifyAccessToken, extractTokenFromHeader } = require('../config/jwt');
const logger = require('../utils/logger');
const { Employee } = require('../models/Employee.model');

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et charge les informations utilisateur
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extraction du token depuis le header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
    }
    
    // Vérification du token
    const decoded = verifyAccessToken(token);
    
    // Chargement des informations utilisateur depuis la base de données
    const user = await Employee.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          association: 'assignedEquipment',
          attributes: ['id', 'label', 'type', 'status']
        }
      ]
    });
    
    if (!user) {
      logger.warn(`Token valide mais utilisateur inexistant: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (user.status !== 'active') {
      logger.warn(`Tentative de connexion utilisateur inactif: ${user.matricule}`);
      return res.status(401).json({
        success: false,
        message: 'Compte utilisateur désactivé'
      });
    }
    
    // Mise à jour de la dernière activité
    await user.update({ lastLoginAt: new Date() });
    
    // Ajout des informations utilisateur à la requête
    req.user = {
      id: user.id,
      matricule: user.matricule,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      service: user.service,
      roles: user.roles,
      status: user.status
    };
    
    // Ajout des permissions basées sur les rôles
    req.user.permissions = calculatePermissions(user.roles);
    
    logger.debug(`Utilisateur authentifié: ${user.matricule} (${user.roles.join(', ')})`);
    next();
    
  } catch (error) {
    logger.error('Erreur middleware authentification:', error);
    
    if (error.message === 'Token expiré') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Token invalide') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'TOKEN_INVALID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

/**
 * Middleware d'autorisation basé sur les rôles
 * @param {string|string[]} requiredRoles - Rôle(s) requis
 * @returns {Function} - Middleware Express
 */
const requireRoles = (requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }
    
    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      logger.warn(`Accès refusé pour ${req.user.matricule}. Rôles requis: ${roles.join(', ')}, Rôles utilisateur: ${userRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        requiredRoles: roles,
        userRoles: userRoles
      });
    }
    
    next();
  };
};

/**
 * Middleware d'autorisation basé sur les permissions
 * @param {string|string[]} requiredPermissions - Permission(s) requise(s)
 * @returns {Function} - Middleware Express
 */
const requirePermissions = (requiredPermissions) => {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }
    
    const userPermissions = req.user.permissions || [];
    const hasRequiredPermission = permissions.some(permission => userPermissions.includes(permission));
    
    if (!hasRequiredPermission) {
      logger.warn(`Accès refusé pour ${req.user.matricule}. Permissions requises: ${permissions.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        requiredPermissions: permissions
      });
    }
    
    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur peut accéder à ses propres données
 * ou possède les permissions d'administrateur
 */
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }
  
  const targetUserId = req.params.id || req.params.employeeId;
  const isAdmin = req.user.roles.includes('ADMIN');
  const isSelf = req.user.id === targetUserId;
  
  if (!isAdmin && !isSelf) {
    logger.warn(`Tentative d'accès non autorisé par ${req.user.matricule} aux données de l'utilisateur ${targetUserId}`);
    return res.status(403).json({
      success: false,
      message: 'Vous ne pouvez accéder qu\'à vos propres données'
    });
  }
  
  next();
};

/**
 * Calcule les permissions basées sur les rôles
 * @param {string[]} roles - Rôles de l'utilisateur
 * @returns {string[]} - Liste des permissions
 */
const calculatePermissions = (roles) => {
  const permissions = new Set();
  
  // Permissions de base pour tous les utilisateurs authentifiés
  permissions.add('read:own_profile');
  permissions.add('update:own_profile');
  permissions.add('read:posts');
  
  roles.forEach(role => {
    switch (role) {
      case 'ADMIN':
        // Administrateur : toutes les permissions
        permissions.add('read:employees');
        permissions.add('write:employees');
        permissions.add('delete:employees');
        permissions.add('read:visits');
        permissions.add('write:visits');
        permissions.add('read:packages');
        permissions.add('write:packages');
        permissions.add('read:equipment');
        permissions.add('write:equipment');
        permissions.add('read:hse');
        permissions.add('write:hse');
        permissions.add('read:posts');
        permissions.add('write:posts');
        permissions.add('delete:posts');
        permissions.add('manage:system');
        break;
        
      case 'HSE':
        // Responsable HSE
        permissions.add('read:employees');
        permissions.add('write:employees');
        permissions.add('read:equipment');
        permissions.add('write:equipment');
        permissions.add('read:hse');
        permissions.add('write:hse');
        permissions.add('read:posts');
        break;
        
      case 'SUPERVISEUR':
        // Superviseur
        permissions.add('read:employees');
        permissions.add('read:visits');
        permissions.add('write:visits');
        permissions.add('read:equipment');
        permissions.add('write:equipment');
        permissions.add('read:posts');
        break;
        
      case 'RECEP':
        // Réceptionniste
        permissions.add('read:visits');
        permissions.add('write:visits');
        permissions.add('read:packages');
        permissions.add('write:packages');
        permissions.add('read:posts');
        break;
        
      case 'COMMUNICATION':
        // Chargé de communication
        permissions.add('read:posts');
        permissions.add('write:posts');
        permissions.add('delete:posts');
        break;
        
      case 'EMPLOYE':
        // Employé standard - permissions de base seulement
        break;
        
      default:
        logger.warn(`Rôle non reconnu: ${role}`);
    }
  });
  
  return Array.from(permissions);
};

/**
 * Middleware optionnel d'authentification
 * N'échoue pas si aucun token n'est fourni, mais charge l'utilisateur si disponible
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }
    
    const decoded = verifyAccessToken(token);
    const user = await Employee.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        matricule: user.matricule,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        service: user.service,
        roles: user.roles,
        status: user.status
      };
      req.user.permissions = calculatePermissions(user.roles);
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    logger.debug('Erreur auth optionnelle:', error.message);
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRoles,
  requirePermissions,
  requireSelfOrAdmin,
  optionalAuth,
  calculatePermissions
};
