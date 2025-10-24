const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PackageMail = sequelize.define('PackageMail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  trackingNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Le numéro de suivi est requis' }
    }
  },
  
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom de l\'expéditeur est requis' }
    }
  },
  
  senderCompany: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  senderPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  type: {
    type: DataTypes.ENUM('package', 'mail', 'document', 'equipment'),
    allowNull: false,
    defaultValue: 'package'
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Poids en kg'
  },
  
  dimensions: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Dimensions (L x l x H)'
  },
  
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valeur déclarée'
  },
  
  status: {
    type: DataTypes.ENUM('pending', 'delivered', 'returned', 'lost'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  deliveredBy: {
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
  
  requiresSignature: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  signature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Signature numérique'
  }
}, {
  tableName: 'package_mails',
  timestamps: true
});

module.exports = PackageMail;
