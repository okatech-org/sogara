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
        lastName: 'BEKALE',
        matricule: 'EMP001',
        service: 'Production',
        roles: ['EMPLOYE'],
        competences: ['Opérateur', 'Sécurité niveau 1'],
        habilitations: ['Conduite', 'EPI obligatoire'],
        email: 'pierre.bekale@sogara.com',
        password: 'Employee123!',
        status: 'active',
        stats: { visitsReceived: 5, packagesReceived: 2, hseTrainingsCompleted: 3 }
      },
      {
        id: '2',
        firstName: 'Sylvie',
        lastName: 'KOUMBA',
        matricule: 'REC001',
        service: 'Sécurité',
        roles: ['RECEP'],
        competences: ['Gestion sécurité', 'Accueil visiteurs', 'Gestion colis'],
        habilitations: ['Badge visiteurs', 'Système accès', 'Contrôle sécurité'],
        email: 'sylvie.koumba@sogara.com',
        password: 'Reception123!',
        status: 'active',
        stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 }
      },
      {
        id: '3',
        firstName: 'PELLEN',
        lastName: 'Asted',
        matricule: 'ADM001',
        service: 'ORGANEUS Gabon',
        roles: ['ADMIN'],
        competences: ['Administration systèmes', 'Sécurité informatique', 'Supervision'],
        habilitations: ['Accès total', 'Configuration système'],
        email: 'pellen.asted@organeus.ga',
        password: 'Admin123!',
        status: 'active',
        stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 }
      },
      {
        id: '4',
        firstName: 'Marie-Claire',
        lastName: 'NZIEGE',
        matricule: 'HSE001',
        service: 'HSE et Conformité',
        roles: ['HSE', 'COMPLIANCE', 'SECURITE'],
        competences: ['Sécurité industrielle', 'Formation HSE', 'Audit conformité', 'Gestion sécurité', 'Conformité réglementaire'],
        habilitations: ['Inspection sécurité', 'Formation obligatoire', 'Incident management', 'Gestion réception'],
        email: 'marie-claire.nziege@sogara.com',
        password: 'HSE123!',
        status: 'active',
        stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 }
      },
      {
        id: '6',
        firstName: 'Clarisse',
        lastName: 'MBOUMBA',
        matricule: 'COM001',
        service: 'Communication',
        roles: ['COMMUNICATION'],
        competences: ['Communication interne', 'Rédaction', 'Réseaux sociaux', 'Relations presse', 'Gestion SOGARA Connect'],
        habilitations: ['Diffusion information', 'Gestion événements', 'Gestion contenu'],
        email: 'clarisse.mboumba@sogara.com',
        password: 'Communication123!',
        status: 'active',
        stats: { visitsReceived: 4, packagesReceived: 2, hseTrainingsCompleted: 5 }
      },
      {
        id: '7',
        firstName: 'Daniel',
        lastName: 'MVOU',
        matricule: 'DG001',
        service: 'Direction Générale',
        roles: ['DG', 'ADMIN'],
        competences: ['Direction générale', 'Stratégie', 'Management', 'Pilotage entreprise', 'Relations institutionnelles'],
        habilitations: ['Accès total', 'Décisions stratégiques', 'Représentation légale'],
        email: 'daniel.mvou@sogara.com',
        password: 'DG123!',
        status: 'active',
        stats: { visitsReceived: 10, packagesReceived: 5, hseTrainingsCompleted: 10 }
      },
      {
        id: '8',
        firstName: 'Brigitte',
        lastName: 'NGUEMA',
        matricule: 'DRH001',
        service: 'Ressources Humaines',
        roles: ['DRH', 'ADMIN'],
        competences: ['Gestion RH', 'Recrutement', 'Formation', 'Développement compétences', 'Relations sociales'],
        habilitations: ['Gestion personnel', 'Validation formations', 'Administration RH'],
        email: 'brigitte.nguema@sogara.com',
        password: 'DRH123!',
        status: 'active',
        stats: { visitsReceived: 7, packagesReceived: 4, hseTrainingsCompleted: 9 }
      },
      {
        id: '10',
        firstName: 'Jean-Luc',
        lastName: 'BERNARD',
        matricule: 'EXT001',
        service: 'Total Energies Gabon',
        roles: ['EXTERNE'],
        competences: ['Maintenance compresseurs', 'Hydraulique', 'Automatisme'],
        habilitations: [],
        email: 'jl.bernard@totalenergies.com',
        password: 'External123!',
        status: 'active',
        stats: { visitsReceived: 0, packagesReceived: 0, hseTrainingsCompleted: 0 }
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
