const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  visitorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'visitors',
      key: 'id'
    }
  },
  
  hostEmployeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Date de visite invalide' },
      isAfter: {
        args: new Date().toISOString().split('T')[0],
        msg: 'La date de visite doit être dans le futur'
      }
    }
  },
  
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  checkedOutAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  status: {
    type: DataTypes.ENUM('expected', 'waiting', 'in_progress', 'checked_out'),
    allowNull: false,
    defaultValue: 'expected'
  },
  
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [5, 500],
        msg: 'L\'objet de la visite doit contenir entre 5 et 500 caractères'
      }
    }
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  badgeNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'visits',
  timestamps: true,
  
  // Hooks pour gestion automatique des timestamps
  hooks: {
    beforeUpdate: (visit) => {
      if (visit.changed('status')) {
        const now = new Date();
        
        switch (visit.status) {
          case 'in_progress':
            if (!visit.checkedInAt) {
              visit.checkedInAt = now;
            }
            break;
          case 'checked_out':
            if (!visit.checkedOutAt) {
              visit.checkedOutAt = now;
            }
            break;
        }
      }
    }
  }
});

// Relations
Visit.associate = function(models) {
  Visit.belongsTo(models.Visitor, {
    foreignKey: 'visitorId',
    as: 'visitor'
  });
  
  Visit.belongsTo(models.Employee, {
    foreignKey: 'hostEmployeeId',
    as: 'hostEmployee'
  });
};

// Méthodes d'instance
Visit.prototype.getDuration = function() {
  if (this.checkedInAt && this.checkedOutAt) {
    return Math.round((this.checkedOutAt - this.checkedInAt) / (1000 * 60)); // en minutes
  }
  return null;
};

Visit.prototype.isActive = function() {
  return ['waiting', 'in_progress'].includes(this.status);
};

// Méthodes statiques
Visit.getTodaysVisits = function() {
  const { Op } = require('sequelize');
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return this.findAll({
    where: {
      scheduledAt: {
        [Op.between]: [startOfDay, endOfDay]
      }
    },
    include: [
      { association: 'visitor' },
      { association: 'hostEmployee', attributes: { exclude: ['password'] } }
    ],
    order: [['scheduledAt', 'ASC']]
  });
};

Visit.getVisitsByDate = function(date) {
  const { Op } = require('sequelize');
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findAll({
    where: {
      scheduledAt: {
        [Op.between]: [startOfDay, endOfDay]
      }
    },
    include: [
      { association: 'visitor' },
      { association: 'hostEmployee', attributes: { exclude: ['password'] } }
    ],
    order: [['scheduledAt', 'ASC']]
  });
};

Visit.getActiveVisits = function() {
  return this.findAll({
    where: {
      status: {
        [Op.in]: ['waiting', 'in_progress']
      }
    },
    include: [
      { association: 'visitor' },
      { association: 'hostEmployee', attributes: { exclude: ['password'] } }
    ],
    order: [['scheduledAt', 'ASC']]
  });
};

Visit.getTodaysStats = function() {
  const { Op } = require('sequelize');
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return this.findAll({
    where: {
      scheduledAt: {
        [Op.between]: [startOfDay, endOfDay]
      }
    },
    attributes: ['status'],
    raw: true
  }).then(visits => {
    const stats = {
      total: visits.length,
      expected: 0,
      waiting: 0,
      in_progress: 0,
      checked_out: 0
    };
    
    visits.forEach(visit => {
      stats[visit.status]++;
    });
    
    return stats;
  });
};

module.exports = Visit;
