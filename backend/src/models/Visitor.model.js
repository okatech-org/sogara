const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitor = sequelize.define('Visitor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le prénom est requis' },
      len: {
        args: [2, 50],
        msg: 'Le prénom doit contenir entre 2 et 50 caractères'
      }
    }
  },
  
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom est requis' },
      len: {
        args: [2, 50],
        msg: 'Le nom doit contenir entre 2 et 50 caractères'
      }
    }
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Format email invalide' }
    }
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  idNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Numéro de pièce d\'identité'
  },
  
  idType: {
    type: DataTypes.ENUM('CNI', 'PASSPORT', 'PERMIS', 'AUTRE'),
    allowNull: true
  },
  
  photo: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la photo'
  },
  
  status: {
    type: DataTypes.ENUM('active', 'blocked'),
    allowNull: false,
    defaultValue: 'active'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'visitors',
  timestamps: true,
  
  instanceMethods: {
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }
});

module.exports = Visitor;