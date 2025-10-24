const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EquipmentHistory = sequelize.define('EquipmentHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  equipmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'equipment',
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
  
  action: {
    type: DataTypes.ENUM('created', 'assigned', 'returned', 'maintenance', 'repaired', 'retired'),
    allowNull: false
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La description est requise' }
    }
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  previousStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  previousAssignee: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  
  newAssignee: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'equipment_history',
  timestamps: true
});

module.exports = EquipmentHistory;
