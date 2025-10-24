const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('hse_incident', 'training_approval', 'equipment_purchase', 'policy_change', 'audit_plan'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  currentStep: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  totalSteps: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  workflowData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  approvalHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'approval_workflows',
  timestamps: true,
  indexes: [
    {
      fields: ['type', 'status']
    },
    {
      fields: ['requesterId']
    },
    {
      fields: ['approverId']
    },
    {
      fields: ['priority', 'dueDate']
    }
  ]
});

module.exports = ApprovalWorkflow;
