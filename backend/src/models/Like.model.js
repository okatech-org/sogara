module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    }
  }, {
    tableName: 'likes',
    timestamps: true,
    indexes: [
      { fields: ['postId'] },
      { fields: ['userId'] },
      { 
        fields: ['postId', 'userId'],
        unique: true // Un utilisateur ne peut liker qu'une fois par post
      }
    ]
  });

  Like.associate = (models) => {
    Like.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post'
    });
    Like.belongsTo(models.Employee, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Like;
};
