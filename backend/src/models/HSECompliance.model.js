module.exports = (sequelize, DataTypes) => {
  const HSECompliance = sequelize.define('HSECompliance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'safety_compliance',
        'environmental_compliance',
        'health_compliance',
        'security_compliance',
        'regulatory_compliance',
        'internal_policy',
        'industry_standard',
        'other'
      ),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'audit',
        'inspection',
        'assessment',
        'review',
        'certification',
        'documentation',
        'training',
        'equipment_check',
        'other'
      ),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'in_progress',
        'completed',
        'non_compliant',
        'cancelled'
      ),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM(
        'low',
        'medium',
        'high',
        'critical'
      ),
      defaultValue: 'medium'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    frequency: {
      type: DataTypes.ENUM(
        'one_time',
        'daily',
        'weekly',
        'monthly',
        'quarterly',
        'semi_annually',
        'annually',
        'as_needed'
      ),
      defaultValue: 'one_time'
    },
    responsiblePerson: {
      type: DataTypes.UUID,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    responsibleDepartment: {
      type: DataTypes.STRING(100)
    },
    regulatoryReference: {
      type: DataTypes.STRING(200)
    },
    requirements: {
      type: DataTypes.TEXT
    },
    criteria: {
      type: DataTypes.JSON // Compliance criteria and checklist
    },
    evidence: {
      type: DataTypes.JSON // Evidence files and documentation
    },
    findings: {
      type: DataTypes.TEXT
    },
    recommendations: {
      type: DataTypes.TEXT
    },
    correctiveActions: {
      type: DataTypes.TEXT
    },
    followUpDate: {
      type: DataTypes.DATE
    },
    completedAt: {
      type: DataTypes.DATE
    },
    validatedAt: {
      type: DataTypes.DATE
    },
    validatedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    validationNotes: {
      type: DataTypes.TEXT
    },
    score: {
      type: DataTypes.INTEGER // Compliance score percentage
    },
    attachments: {
      type: DataTypes.JSON // Array of file paths
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    }
  }, {
    tableName: 'hse_compliance',
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['dueDate'] },
      { fields: ['responsiblePerson'] },
      { fields: ['priority'] }
    ]
  });

  HSECompliance.associate = (models) => {
    HSECompliance.belongsTo(models.Employee, {
      foreignKey: 'responsiblePerson',
      as: 'responsiblePersonEmployee'
    });
    HSECompliance.belongsTo(models.Employee, {
      foreignKey: 'validatedBy',
      as: 'validatedByEmployee'
    });
    HSECompliance.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return HSECompliance;
};
