const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HSEAudit = sequelize.define('HSEAudit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Le code d\'audit est requis' }
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
  
  type: {
    type: DataTypes.ENUM('internal', 'scheduled', 'emergency'),
    allowNull: false,
    defaultValue: 'internal'
  },
  
  scope: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La portée est requise' }
    }
  },
  
  auditedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    },
    comment: 'HSE002 usually, HSE001 for major audits'
  },
  
  // Additional fields for HSE002 field audits
  auditType: {
    type: DataTypes.ENUM('INTERNAL', 'SCHEDULED', 'EMERGENCY'),
    allowNull: false,
    defaultValue: 'INTERNAL'
  },
  
  // Audit findings with severity levels
  findings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Audit findings with severity and nonconformity status'
  },
  
  // Nonconformities tracking
  nonconformities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Nonconformities with correction tracking'
  },
  
  schedule: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Planning de l\'audit avec dates et durée'
  },
  
  standards: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
    comment: 'Normes auditées: ISO 45001, OSHA, API, etc.'
  },
  
  findings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Observations et constats de l\'audit'
  },
  
  nonconformities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Non-conformités identifiées'
  },
  
  reportGenerated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  reportUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL du rapport généré'
  },
  
  reportDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  status: {
    type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'reported'),
    allowNull: false,
    defaultValue: 'planned'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hse_audits',
  timestamps: true,
  
  hooks: {
    beforeCreate: (audit) => {
      if (!audit.code) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        audit.code = `AUDIT${year}${month}${day}${random}`;
      }
    }
  }
});

module.exports = HSEAudit;
