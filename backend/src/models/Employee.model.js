const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Employee = sequelize.define('Employee', {
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
  
  matricule: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: {
      msg: 'Ce matricule existe déjà'
    },
    validate: {
      isMatriculeFormat(value) {
        if (!/^[A-Z]{3}\d{3}$/.test(value)) {
          throw new Error('Le matricule doit suivre le format XXX000 (3 lettres majuscules + 3 chiffres)');
        }
      }
    }
  },
  
  service: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le service est requis' }
    }
  },
  
  roles: {
    type: DataTypes.ARRAY(DataTypes.ENUM('ADMIN', 'HSE', 'SUPERVISEUR', 'RECEP', 'EMPLOYE', 'COMMUNICATION')),
    allowNull: false,
    defaultValue: ['EMPLOYE'],
    validate: {
      hasAtLeastOneRole(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Au moins un rôle est requis');
        }
      }
    }
  },
  
  competences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  habilitations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: {
      msg: 'Cette adresse email est déjà utilisée'
    },
    validate: {
      isEmail: {
        msg: 'Adresse email invalide'
      }
    }
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
  
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Peut être null pour les employés créés sans compte utilisateur
    validate: {
      len: {
        args: [8, 255],
        msg: 'Le mot de passe doit contenir au moins 8 caractères'
      }
    }
  },
  
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  
  photo: {
    type: DataTypes.TEXT, // URL ou path vers la photo
    allowNull: true
  },
  
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      visitsReceived: 0,
      packagesReceived: 0,
      hseTrainingsCompleted: 0
    }
  }
}, {
  tableName: 'employees',
  timestamps: true,
  
  // Hooks pour le hashage du mot de passe
  hooks: {
    beforeCreate: async (employee) => {
      if (employee.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        employee.password = await bcrypt.hash(employee.password, saltRounds);
      }
    },
    
    beforeUpdate: async (employee) => {
      if (employee.changed('password') && employee.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        employee.password = await bcrypt.hash(employee.password, saltRounds);
      }
    }
  },
  
  // Méthodes d'instance
  instanceMethods: {
    async validatePassword(password) {
      if (!this.password) return false;
      return bcrypt.compare(password, this.password);
    },
    
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    
    hasRole(role) {
      return this.roles.includes(role);
    },
    
    hasAnyRole(roles) {
      return roles.some(role => this.roles.includes(role));
    },
    
    toSafeJSON() {
      const data = this.toJSON();
      delete data.password;
      return data;
    }
  },
  
  // Scopes pour les requêtes fréquentes
  scopes: {
    active: {
      where: {
        status: 'active'
      }
    },
    
    withRole: (role) => ({
      where: {
        roles: {
          [sequelize.Sequelize.Op.contains]: [role]
        }
      }
    }),
    
    byService: (service) => ({
      where: {
        service
      }
    }),
    
    safeAttributes: {
      attributes: { exclude: ['password'] }
    }
  }
});

// Méthodes de classe
Employee.prototype.validatePassword = async function(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

Employee.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Employee.prototype.hasRole = function(role) {
  return this.roles.includes(role);
};

Employee.prototype.hasAnyRole = function(roles) {
  return roles.some(role => this.roles.includes(role));
};

Employee.prototype.toSafeJSON = function() {
  const data = this.toJSON();
  delete data.password;
  return data;
};

// Méthodes statiques
Employee.findByMatricule = function(matricule) {
  return this.findOne({
    where: { matricule }
  });
};

Employee.findActiveByMatricule = function(matricule) {
  return this.scope('active').findOne({
    where: { matricule }
  });
};

Employee.findByRole = function(role) {
  return this.scope(['active', { method: ['withRole', role] }]).findAll();
};

Employee.findByService = function(service) {
  return this.scope(['active', { method: ['byService', service] }]).findAll();
};

module.exports = Employee;
