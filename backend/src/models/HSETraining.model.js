const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HSETraining = sequelize.define('HSETraining', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le titre est requis' }
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  type: {
    type: DataTypes.ENUM('safety', 'health', 'environment', 'security', 'compliance', 'other'),
    allowNull: false,
    defaultValue: 'safety'
  },
  
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La catégorie est requise' }
    }
  },
  
  employeeId: {
    type: DataTypes.UUID,
    allowNull: true, // Made optional for coordination by HSE002
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  // HSE002 coordination fields
  coordinatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    },
    comment: 'HSE002 or HSE001 who coordinates this training'
  },
  
  // Training schedule for coordination
  schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Training schedule with sessions and participants'
  },
  
  // Compliance tracking
  compliance: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Compliance requirements and regulations'
  },
  
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Durée en heures'
  },
  
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  instructor: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  externalProvider: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Organisme de formation externe'
  },
  
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Coût de la formation'
  },
  
  certificateNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  
  certificateExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Score obtenu (sur 100)'
  },
  
  passingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 70
  },
  
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  required: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Formation obligatoire'
  },
  
  renewalRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Renouvellement requis'
  },
  
  renewalPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Période de renouvellement en mois'
  },
  
  materials: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'Matériels de formation'
  },
  
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'URLs des documents de formation'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Retour de l\'employé'
  },
  
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Note de satisfaction (1-5)'
  }
}, {
  tableName: 'hse_trainings',
  timestamps: true
});

module.exports = HSETraining;