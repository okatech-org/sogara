const { sequelize } = require('../config/database');

// Import all models
const Employee = require('./Employee.model');
const Visitor = require('./Visitor.model');
const Visit = require('./Visit.model');
const PackageMail = require('./PackageMail.model');
const Equipment = require('./Equipment.model');
const EquipmentHistory = require('./EquipmentHistory.model');
const HSEIncident = require('./HSEIncident.model');
const HSETraining = require('./HSETraining.model');
const HSEAudit = require('./HSEAudit.model');
const Post = require('./Post.model');
const PostComment = require('./PostComment.model');
const PostLike = require('./PostLike.model');
const Analytics = require('./Analytics.model');
const ApprovalWorkflow = require('./ApprovalWorkflow.model');
const ApprovalStep = require('./ApprovalStep.model');

// Initialize models
const models = {
  Employee,
  Visitor,
  Visit,
  PackageMail,
  Equipment,
  EquipmentHistory,
  HSEIncident,
  HSETraining,
  HSEAudit,
  Post,
  PostComment,
  PostLike,
  Analytics,
  ApprovalWorkflow,
  ApprovalStep
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  ...models
};
