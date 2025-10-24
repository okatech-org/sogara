const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom de l\'équipement est requis' }
    }
  },
  
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Le numéro de série est requis' }
    }
  },
  
  type: {
    type: DataTypes.ENUM('safety', 'tool', 'vehicle', 'electronic', 'other'),
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
  
  brand: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  model: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  status: {
    type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired', 'lost'),
    allowNull: false,
    defaultValue: 'available'
  },
  
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    allowNull: false,
    defaultValue: 'good'
  },
  
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  returnedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  lastMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  nextMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  
  warrantyExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  qrCode: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL ou contenu du QR code'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'equipment',
  timestamps: true
});

module.exports = Equipment;