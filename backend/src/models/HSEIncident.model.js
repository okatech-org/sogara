const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HSEIncident = sequelize.define('HSEIncident', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  incidentNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Le numéro d\'incident est requis' }
    }
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
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La description est requise' }
    }
  },
  
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  
  // Approval workflow for HSE002
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved_hse002', 'requires_hse001', 'approved_hse001'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  // Priority levels for HSE002 workflow
  priority: {
    type: DataTypes.ENUM('P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'),
    allowNull: false,
    defaultValue: 'P3_MEDIUM'
  },
  
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    },
    comment: 'ID of HSE002 or HSE001 who approved'
  },
  
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    },
    comment: 'HSE002 or HSE001 assigned to handle this incident'
  },
  
  category: {
    type: DataTypes.ENUM('safety', 'health', 'environment', 'security', 'other'),
    allowNull: false,
    defaultValue: 'safety'
  },
  
  status: {
    type: DataTypes.ENUM('open', 'investigating', 'action_required', 'monitoring', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  },
  
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le lieu est requis' }
    }
  },
  
  incidentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  reportedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  witnesses: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'Liste des témoins'
  },
  
  injuries: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Nombre de blessés'
  },
  
  fatalities: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Nombre de décès'
  },
  
  environmentalImpact: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  propertyDamage: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Coût des dégâts matériels'
  },
  
  rootCause: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cause racine identifiée'
  },
  
  correctiveActions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Actions correctives avec statuts et assignations'
  },
  
  preventiveActions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Actions préventives'
  },
  
  investigationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'URLs des fichiers joints'
  },
  
  notifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { toHSE001: false, toDirector: false, toOthers: [] },
    comment: 'Notifications envoyées pour cet incident'
  },
  
  closedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  closedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Additional fields for HSE002 operations
  affectedEmployees: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    comment: 'Employee IDs affected by this incident'
  },
  
  injuryLevel: {
    type: DataTypes.ENUM('NONE', 'MINOR', 'SERIOUS', 'FATAL'),
    allowNull: false,
    defaultValue: 'NONE'
  },
  
  environmentalImpact: {
    type: DataTypes.ENUM('NONE', 'MINOR', 'MAJOR', 'CATASTROPHIC'),
    allowNull: false,
    defaultValue: 'NONE'
  }
}, {
  tableName: 'hse_incidents',
  timestamps: true,
  
  hooks: {
    beforeCreate: (incident) => {
      if (!incident.incidentNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        incident.incidentNumber = `INC${year}${month}${day}${random}`;
      }
    }
  }
});

module.exports = HSEIncident;