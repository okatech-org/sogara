module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.UUID,
      references: {
        model: 'Comments',
        key: 'id'
      }
    },
    edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    editedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    indexes: [
      { fields: ['postId'] },
      { fields: ['authorId'] },
      { fields: ['parentId'] }
    ]
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post'
    });
    Comment.belongsTo(models.Employee, {
      foreignKey: 'authorId',
      as: 'author'
    });
    Comment.belongsTo(models.Comment, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    Comment.hasMany(models.Comment, {
      foreignKey: 'parentId',
      as: 'replies'
    });
  };

  return Comment;
};
