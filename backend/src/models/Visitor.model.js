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
  
  company: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La société est requise' }
    }
  },
  
  idDocument: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le numéro de document est requis' }
    }
  },
  
  documentType: {
    type: DataTypes.ENUM('cin', 'passport', 'other'),
    allowNull: false,
    defaultValue: 'cin'
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isPhoneFormat(value) {
        if (value && !/^[0-9+\-() ]+$/.test(value)) {
          throw new Error('Numéro de téléphone invalide');
        }
      }
    }
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Adresse email invalide'
      }
    }
  },
  
  photo: {
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

// Méthodes d'instance
Visitor.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Méthodes statiques
Visitor.searchByName = function(searchTerm) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${searchTerm}%` } },
        { company: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    order: [['lastName', 'ASC'], ['firstName', 'ASC']]
  });
};

module.exports = Visitor;
