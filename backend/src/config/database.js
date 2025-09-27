const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuration de la base de données
const config = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sogara_db',
    username: process.env.DB_USER || 'sogara_user',
    password: process.env.DB_PASSWORD || 'sogara_password',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  test: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME + '_test' || 'sogara_db_test',
    username: process.env.DB_USER || 'sogara_user',
    password: process.env.DB_PASSWORD || 'sogara_password',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connexion à la base de données établie avec succès');
  } catch (error) {
    logger.error('❌ Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};
