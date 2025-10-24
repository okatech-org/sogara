const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalStep = sequelize.define('ApprovalStep', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workflowId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ApprovalWorkflows',
      key: 'id'
    }
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stepName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'skipped'),
    defaultValue: 'pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  canDelegate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'approval_steps',
  timestamps: true,
  indexes: [
    {
      fields: ['workflowId', 'stepNumber']
    },
    {
      fields: ['approverId', 'status']
    },
    {
      fields: ['status', 'dueDate']
    }
  ]
});

module.exports = ApprovalStep;
