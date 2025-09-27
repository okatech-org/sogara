require('dotenv').config();

const { sequelize, testConnection } = require('./database');
const logger = require('../utils/logger');

// Import de tous les modèles pour créer les relations
const Employee = require('../models/Employee.model');

const migrate = async () => {
  try {
    logger.info('🔄 Démarrage de la migration de la base de données...');
    
    // Test de connexion
    await testConnection();
    
    // Synchronisation des modèles (création/mise à jour des tables)
    await sequelize.sync({ 
      force: process.env.NODE_ENV === 'development' && process.argv.includes('--force'),
      alter: process.env.NODE_ENV === 'development' && !process.argv.includes('--force')
    });
    
    logger.info('✅ Migration terminée avec succès');
    
    // Création du compte administrateur par défaut si non existant
    await createDefaultAdmin();
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await Employee.findOne({
      where: {
        roles: {
          [sequelize.Sequelize.Op.contains]: ['ADMIN']
        }
      }
    });
    
    if (existingAdmin) {
      logger.info('👤 Compte administrateur existant trouvé');
      return;
    }
    
    // Créer le compte admin par défaut
    const defaultAdmin = await Employee.create({
      firstName: 'Admin',
      lastName: 'SOGARA',
      matricule: 'ADM000',
      service: 'Administration',
      roles: ['ADMIN'],
      email: 'admin@sogara.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'SogaraAdmin2024!',
      status: 'active',
      competences: ['Administration système', 'Gestion des utilisateurs'],
      habilitations: ['Accès total', 'Configuration système']
    });
    
    logger.info(`✅ Compte administrateur créé: ${defaultAdmin.matricule}`);
    logger.info(`📧 Email: ${defaultAdmin.email}`);
    logger.info(`🔒 Mot de passe par défaut: ${process.env.ADMIN_DEFAULT_PASSWORD || 'SogaraAdmin2024!'}`);
    logger.warn('⚠️  IMPORTANT: Changez le mot de passe par défaut après la première connexion!');
    
  } catch (error) {
    logger.error('❌ Erreur création admin par défaut:', error);
    throw error;
  }
};

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrate();
}

module.exports = { migrate, createDefaultAdmin };
