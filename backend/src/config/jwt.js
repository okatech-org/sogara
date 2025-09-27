const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  logger.error('❌ JWT_SECRET et JWT_REFRESH_SECRET doivent être définis dans les variables d\'environnement');
  process.exit(1);
}

/**
 * Génère un token JWT d'accès
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} - Token JWT
 */
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
      issuer: 'sogara-api',
      audience: 'sogara-frontend'
    });
  } catch (error) {
    logger.error('Erreur génération token d\'accès:', error);
    throw new Error('Erreur interne de génération de token');
  }
};

/**
 * Génère un token JWT de refresh
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} - Token JWT refresh
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRE,
      issuer: 'sogara-api',
      audience: 'sogara-frontend'
    });
  } catch (error) {
    logger.error('Erreur génération token refresh:', error);
    throw new Error('Erreur interne de génération de token refresh');
  }
};

/**
 * Vérifie un token JWT d'accès
 * @param {string} token - Token à vérifier
 * @returns {Object} - Payload décodé
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'sogara-api',
      audience: 'sogara-frontend'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    }
    logger.error('Erreur vérification token:', error);
    throw new Error('Erreur de vérification du token');
  }
};

/**
 * Vérifie un token JWT refresh
 * @param {string} token - Token refresh à vérifier
 * @returns {Object} - Payload décodé
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'sogara-api',
      audience: 'sogara-frontend'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token refresh expiré');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token refresh invalide');
    }
    logger.error('Erreur vérification token refresh:', error);
    throw new Error('Erreur de vérification du token refresh');
  }
};

/**
 * Extrait le token du header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} - Token extrait ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Décode un token sans le vérifier (pour debug)
 * @param {string} token - Token à décoder
 * @returns {Object} - Payload décodé
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    logger.error('Erreur décodage token:', error);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  decodeToken
};
