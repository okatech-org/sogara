module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trackingNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    senderName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    senderContact: {
      type: DataTypes.STRING(50)
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2)
    },
    dimensions: {
      type: DataTypes.STRING(50) // Format: "L x W x H"
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'picked_up',
        'delivered',
        'cancelled',
        'returned'
      ),
      defaultValue: 'pending'
    },
    arrivalDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    pickedUpAt: {
      type: DataTypes.DATE
    },
    pickedUpBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    deliveredAt: {
      type: DataTypes.DATE
    },
    deliveredBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    deliveryNotes: {
      type: DataTypes.TEXT
    },
    cancelledAt: {
      type: DataTypes.DATE
    },
    cancellationReason: {
      type: DataTypes.TEXT
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
    tableName: 'packages',
    timestamps: true,
    indexes: [
      { fields: ['trackingNumber'] },
      { fields: ['recipientId'] },
      { fields: ['status'] },
      { fields: ['arrivalDate'] }
    ]
  });

  Package.associate = (models) => {
    Package.belongsTo(models.Employee, {
      foreignKey: 'recipientId',
      as: 'recipient'
    });
    Package.belongsTo(models.Employee, {
      foreignKey: 'pickedUpBy',
      as: 'pickedUpByEmployee'
    });
    Package.belongsTo(models.Employee, {
      foreignKey: 'deliveredBy',
      as: 'deliveredByEmployee'
    });
    Package.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return Package;
};
