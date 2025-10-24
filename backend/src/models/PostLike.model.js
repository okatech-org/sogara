const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'post_likes',
  timestamps: true,
  
  indexes: [
    {
      unique: true,
      fields: ['postId', 'userId'],
      name: 'unique_post_user_like'
    }
  ]
});

module.exports = PostLike;
