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
  
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  purpose: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le motif de visite est requis' }
    }
  },
  
  status: {
    type: DataTypes.ENUM('pending', 'checked_in', 'checked_out', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  checkinTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  checkoutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  badgeNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durée en minutes'
  }
}, {
  tableName: 'visits',
  timestamps: true,
  
  hooks: {
    beforeUpdate: (visit) => {
      if (visit.changed('checkinTime') && visit.changed('checkoutTime')) {
        const checkin = new Date(visit.checkinTime);
        const checkout = new Date(visit.checkoutTime);
        visit.duration = Math.round((checkout - checkin) / (1000 * 60));
      }
    }
  }
});

module.exports = Visit;