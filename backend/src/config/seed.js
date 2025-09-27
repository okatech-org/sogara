require('dotenv').config();

const { sequelize, testConnection } = require('./database');
const logger = require('../utils/logger');
const Employee = require('../models/Employee.model');

const seedData = async () => {
  try {
    logger.info('🌱 Démarrage du seeding de la base de données...');
    
    // Test de connexion
    await testConnection();
    
    // Création des employés de démonstration
    await seedEmployees();
    
    logger.info('✅ Seeding terminé avec succès');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

const seedEmployees = async () => {
  try {
    // Données des employés de démonstration (identiques au frontend)
    const demoEmployees = [
      {
        id: '1',
        firstName: 'Pierre',
        lastName: 'ANTCHOUET',
        matricule: 'EMP001',
        service: 'Production',
        roles: ['EMPLOYE'],
        competences: ['Opérateur', 'Sécurité niveau 1'],
        habilitations: ['Conduite', 'EPI obligatoire'],
        email: 'pierre.antchouet@sogara.com',
        password: 'Employee123!',
        status: 'active',
        stats: { visitsReceived: 5, packagesReceived: 2, hseTrainingsCompleted: 3 }
      },
      {
        id: '2',
        firstName: 'Sylvie',
        lastName: 'KOUMBA',
        matricule: 'REC001',
        service: 'Accueil',
        roles: ['RECEP'],
        competences: ['Accueil visiteurs', 'Gestion colis'],
        habilitations: ['Badge visiteurs', 'Système accès'],
        email: 'sylvie.koumba@sogara.com',
        password: 'Reception123!',
        status: 'active',
        stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 }
      },
      {
        id: '3',
        firstName: 'Alain',
        lastName: 'OBAME',
        matricule: 'ADM001',
        service: 'Direction',
        roles: ['ADMIN'],
        competences: ['Gestion système', 'Administration', 'Supervision'],
        habilitations: ['Accès total', 'Configuration système'],
        email: 'alain.obame@sogara.com',
        password: 'Admin123!',
        status: 'active',
        stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 }
      },
      {
        id: '4',
        firstName: 'Marie',
        lastName: 'LAKIBI',
        matricule: 'HSE001',
        service: 'HSE',
        roles: ['HSE'],
        competences: ['Sécurité industrielle', 'Formation HSE', 'Audit conformité'],
        habilitations: ['Inspection sécurité', 'Formation obligatoire', 'Incident management'],
        email: 'marie.lakibi@sogara.com',
        password: 'HSE123!',
        status: 'active',
        stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 }
      },
      {
        id: '5',
        firstName: 'Christian',
        lastName: 'ELLA',
        matricule: 'SUP001',
        service: 'Production',
        roles: ['SUPERVISEUR'],
        competences: ['Management équipes', 'Planification', 'Contrôle qualité'],
        habilitations: ['Supervision opérations', 'Validation processus'],
        email: 'christian.ella@sogara.com',
        password: 'Supervisor123!',
        status: 'active',
        stats: { visitsReceived: 12, packagesReceived: 6, hseTrainingsCompleted: 7 }
      },
      {
        id: '6',
        firstName: 'Aminata',
        lastName: 'SECK',
        matricule: 'COM001',
        service: 'Communication',
        roles: ['COMMUNICATION'],
        competences: ['Communication interne', 'Rédaction', 'Réseaux sociaux', 'Relations presse'],
        habilitations: ['Diffusion information', 'Gestion événements'],
        email: 'aminata.seck@sogara.com',
        password: 'Communication123!',
        status: 'active',
        stats: { visitsReceived: 4, packagesReceived: 2, hseTrainingsCompleted: 5 }
      }
    ];

    // Vérifier et créer chaque employé
    for (const employeeData of demoEmployees) {
      const existingEmployee = await Employee.findByMatricule(employeeData.matricule);
      
      if (!existingEmployee) {
        await Employee.create(employeeData);
        logger.info(`👤 Employé créé: ${employeeData.matricule} - ${employeeData.firstName} ${employeeData.lastName}`);
      } else {
        logger.info(`👤 Employé existant: ${employeeData.matricule}`);
        
        // Mettre à jour le mot de passe s'il n'existe pas
        if (!existingEmployee.password) {
          await existingEmployee.update({ password: employeeData.password });
          logger.info(`🔒 Mot de passe ajouté pour: ${employeeData.matricule}`);
        }
      }
    }

    logger.info('✅ Employés de démonstration créés');
    
    // Afficher les informations de connexion
    logger.info('\n📋 COMPTES DE DÉMONSTRATION:');
    logger.info('┌─────────┬───────────────────────┬─────────────┬─────────────────┐');
    logger.info('│ Matricule│ Nom                   │ Rôle        │ Mot de passe    │');
    logger.info('├─────────┼───────────────────────┼─────────────┼─────────────────┤');
    
    demoEmployees.forEach(emp => {
      const name = `${emp.firstName} ${emp.lastName}`.padEnd(21);
      const role = emp.roles[0].padEnd(11);
      const matricule = emp.matricule.padEnd(7);
      const password = emp.password.padEnd(15);
      logger.info(`│ ${matricule}│ ${name}│ ${role}│ ${password}│`);
    });
    
    logger.info('└─────────┴───────────────────────┴─────────────┴─────────────────┘');
    logger.info('⚠️  IMPORTANT: Changez ces mots de passe par défaut en production!');

  } catch (error) {
    logger.error('❌ Erreur lors du seeding des employés:', error);
    throw error;
  }
};

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seedData();
}

module.exports = { seedData, seedEmployees };
