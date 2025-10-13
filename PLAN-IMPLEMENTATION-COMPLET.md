# 🗺️ PLAN D'IMPLÉMENTATION COMPLET - SOGARA

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Sprint 1: Fondations Backend](#sprint-1-fondations-backend)
4. [Sprint 2: API Core](#sprint-2-api-core)
5. [Sprint 3: Intégration Frontend](#sprint-3-intégration-frontend)
6. [Sprint 4: Services Avancés](#sprint-4-services-avancés)
7. [Sprint 5: Tests et Déploiement](#sprint-5-tests-et-déploiement)

---

## 🎯 Vue d'Ensemble

### Objectif

Transformer l'application SOGARA d'une démo frontend en une application production-ready complète avec backend fonctionnel, base de données PostgreSQL, et intégration complète.

### Durée Totale

**3-4 semaines** (15-20 jours ouvrés)

### Méthodologie

- Sprints de 1 semaine
- Livraisons incrémentales
- Tests continus
- Documentation en parallèle

---

## ✅ Prérequis

### Logiciels à Installer

#### 1. PostgreSQL 14+

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Linux
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

#### 2. Node.js 18+ (déjà installé)

```bash
node --version  # Vérifier >= 18
npm --version   # Vérifier >= 9
```

#### 3. Outils de Développement

```bash
# Postman ou Insomnia pour tester l'API
# DBeaver ou pgAdmin pour gérer PostgreSQL
```

### Configuration Initiale

#### 1. Créer la Base de Données

```bash
# Se connecter à PostgreSQL
psql postgres

# Dans psql:
CREATE DATABASE sogara_db;
CREATE USER sogara_user WITH ENCRYPTED PASSWORD 'sogara_password_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE sogara_db TO sogara_user;

# Sortir
\q
```

#### 2. Créer .env Backend

```bash
cd backend
touch .env
```

**Contenu de backend/.env:**

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sogara_db
DB_USER=sogara_user
DB_PASSWORD=sogara_password_secure_2024

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-2024
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Bcrypt
BCRYPT_ROUNDS=12

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# OpenAI (pour IA)
OPENAI_API_KEY=sk-proj-VNDc2d...

# Google Gemini (alternative)
GOOGLE_AI_API_KEY=AIzaSyBZcxc...

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@sogara.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=SOGARA Access <noreply@sogara.com>
```

#### 3. Installer Dépendances Backend

```bash
cd backend
npm install

# Installer dépendances additionnelles si nécessaire
npm install sharp  # Optimisation images
```

---

## 🏗️ SPRINT 1: Fondations Backend

**Durée**: 1 semaine (40h)  
**Objectif**: Backend opérationnel avec tous les modèles et migrations

### Jour 1: Configuration et Modèles Visiteurs

#### Tâche 1.1: Vérifier Configuration Base de Données

```bash
# Test de connexion
cd backend
node -e "const { testConnection } = require('./src/config/database'); testConnection();"
```

**Résultat attendu**: ✅ Connexion à la base de données établie avec succès

#### Tâche 1.2: Créer Modèle Visit

**Fichier**: `backend/src/models/Visit.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Visit = sequelize.define(
  'Visit',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    visitorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'visitors',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    hostEmployeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    checkedOutAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('expected', 'waiting', 'in_progress', 'checked_out'),
      defaultValue: 'expected',
    },

    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    badgeNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'visits',
    timestamps: true,
  },
)

module.exports = Visit
```

#### Tâche 1.3: Créer Modèle Visitor

**Fichier**: `backend/src/models/Visitor.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Visitor = sequelize.define(
  'Visitor',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    company: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    idDocument: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    documentType: {
      type: DataTypes.ENUM('cin', 'passport', 'other'),
      defaultValue: 'cin',
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: 'visitors',
    timestamps: true,
    updatedAt: false,
  },
)

// Méthode d'instance
Visitor.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`
}

module.exports = Visitor
```

#### Tâche 1.4: Définir Relations

**Fichier**: `backend/src/models/index.js` (nouveau)

```javascript
const Employee = require('./Employee.model')
const Visitor = require('./Visitor.model')
const Visit = require('./Visit.model')

// Relations Employee - Visit
Employee.hasMany(Visit, {
  foreignKey: 'hostEmployeeId',
  as: 'hostedVisits',
})
Visit.belongsTo(Employee, {
  foreignKey: 'hostEmployeeId',
  as: 'hostEmployee',
})

// Relations Visitor - Visit
Visitor.hasMany(Visit, {
  foreignKey: 'visitorId',
  as: 'visits',
})
Visit.belongsTo(Visitor, {
  foreignKey: 'visitorId',
  as: 'visitor',
})

module.exports = {
  Employee,
  Visitor,
  Visit,
}
```

### Jour 2: Modèles Colis et Équipements

#### Tâche 2.1: Créer Modèle PackageMail

**Fichier**: `backend/src/models/PackageMail.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const PackageMail = sequelize.define(
  'PackageMail',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM('package', 'mail'),
      allowNull: false,
    },

    reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    sender: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    recipientEmployeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    recipientService: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    isConfidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    scannedFileUrls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },

    priority: {
      type: DataTypes.ENUM('normal', 'urgent'),
      defaultValue: 'normal',
    },

    status: {
      type: DataTypes.ENUM('received', 'stored', 'delivered'),
      defaultValue: 'received',
    },

    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    deliveredBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    category: {
      type: DataTypes.ENUM('normal', 'fragile', 'valuable', 'confidential', 'medical'),
      defaultValue: 'normal',
    },
  },
  {
    tableName: 'packages_mails',
    timestamps: true,
  },
)

module.exports = PackageMail
```

#### Tâche 2.2: Créer Modèle Equipment

**Fichier**: `backend/src/models/Equipment.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Equipment = sequelize.define(
  'Equipment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    holderEmployeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    status: {
      type: DataTypes.ENUM('operational', 'maintenance', 'out_of_service'),
      defaultValue: 'operational',
    },

    nextCheckDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    warrantyExpiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    history: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: 'equipment',
    timestamps: true,
  },
)

module.exports = Equipment
```

### Jour 3: Modèles HSE

#### Tâche 3.1: Créer Modèle HSEIncident

**Fichier**: `backend/src/models/HSEIncident.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const HSEIncident = sequelize.define(
  'HSEIncident',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    occurredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('reported', 'investigating', 'resolved'),
      defaultValue: 'reported',
    },

    attachments: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },

    reportedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    investigatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    correctiveActions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    rootCause: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    affectedEmployees: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },

    witnesses: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },
  },
  {
    tableName: 'hse_incidents',
    timestamps: true,
  },
)

module.exports = HSEIncident
```

#### Tâche 3.2: Créer Modèle HSETraining

**Fichier**: `backend/src/models/HSETraining.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const HSETraining = sequelize.define(
  'HSETraining',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM('Critique', 'Obligatoire', 'Spécialisée', 'Management', 'Prévention'),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    objectives: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    durationUnit: {
      type: DataTypes.ENUM('heures', 'minutes', 'jours'),
      defaultValue: 'heures',
    },

    validityMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12,
    },

    requiredForRoles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },

    prerequisites: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },

    content: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    certification: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },

    instructor: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },

    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },

    language: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['Français'],
    },

    deliveryMethods: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['Présentiel'],
    },

    refresherRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    refresherFrequency: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'hse_trainings',
    timestamps: true,
  },
)

module.exports = HSETraining
```

### Jour 4: Modèle SOGARA Connect et Migrations

#### Tâche 4.1: Créer Modèle Post

**Fichier**: `backend/src/models/Post.model.js`

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    category: {
      type: DataTypes.ENUM('news', 'activity', 'announcement', 'event'),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },

    featuredImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },

    videoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },

    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'posts',
    timestamps: true,
  },
)

module.exports = Post
```

#### Tâche 4.2: Créer Script de Migration

**Fichier**: `backend/src/config/migrate.js`

```javascript
require('dotenv').config()

const { sequelize } = require('./database')
const logger = require('../utils/logger')

// Import tous les modèles pour définir les relations
const models = require('../models')

const migrate = async () => {
  try {
    logger.info('🔄 Démarrage des migrations...')

    // Test connexion
    await sequelize.authenticate()
    logger.info('✅ Connexion base de données OK')

    // Synchroniser les modèles (créer/modifier tables)
    await sequelize.sync({ alter: true })

    logger.info('✅ Migrations terminées avec succès')
    logger.info('📊 Tables créées:')
    logger.info('  - employees')
    logger.info('  - visitors')
    logger.info('  - visits')
    logger.info('  - packages_mails')
    logger.info('  - equipment')
    logger.info('  - hse_incidents')
    logger.info('  - hse_trainings')
    logger.info('  - posts')

    process.exit(0)
  } catch (error) {
    logger.error('❌ Erreur lors des migrations:', error)
    process.exit(1)
  }
}

migrate()
```

#### Tâche 4.3: Exécuter Migrations

```bash
cd backend
npm run migrate
```

**Résultat attendu**: Toutes les tables créées dans PostgreSQL

### Jour 5: Seed Data et Vérification

#### Tâche 5.1: Enrichir Seed Data

Modifier `backend/src/config/seed.js` pour inclure des données de démonstration complètes.

#### Tâche 5.2: Charger Seed Data

```bash
cd backend
npm run seed
```

#### Tâche 5.3: Vérifier Base de Données

```bash
psql sogara_db -U sogara_user

# Dans psql:
\dt                        # Lister les tables
SELECT * FROM employees;   # Vérifier employés
\q
```

**Livrables Sprint 1:**

- ✅ PostgreSQL configuré
- ✅ 8 modèles Sequelize créés
- ✅ Migrations exécutées
- ✅ Relations définies
- ✅ Seed data chargé
- ✅ Base de données vérifiée

---

## 🔧 SPRINT 2: API Core

**Durée**: 1 semaine (40h)  
**Objectif**: Créer tous les controllers, routes et services

### Jour 6-7: Controllers Essentiels

#### Tâche 6.1: Compléter employee.controller.js

Ajouter toutes les fonctions CRUD manquantes.

#### Tâche 6.2: Créer visit.controller.js

**Fichier**: `backend/src/controllers/visit.controller.js`

```javascript
const { Visit, Visitor, Employee } = require('../models')
const logger = require('../utils/logger')

const getAllVisits = async (req, res) => {
  try {
    const { status, date, hostEmployeeId } = req.query

    const where = {}
    if (status) where.status = status
    if (hostEmployeeId) where.hostEmployeeId = hostEmployeeId

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      where.scheduledAt = {
        [sequelize.Op.gte]: startDate,
        [sequelize.Op.lt]: endDate,
      }
    }

    const visits = await Visit.findAll({
      where,
      include: [
        {
          model: Visitor,
          as: 'visitor',
          attributes: ['id', 'firstName', 'lastName', 'company'],
        },
        {
          model: Employee,
          as: 'hostEmployee',
          attributes: ['id', 'firstName', 'lastName', 'service'],
        },
      ],
      order: [['scheduledAt', 'DESC']],
    })

    res.json({
      success: true,
      data: { visits },
    })
  } catch (error) {
    logger.error('Erreur getAllVisits:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    })
  }
}

const createVisit = async (req, res) => {
  try {
    const { visitorId, hostEmployeeId, scheduledAt, purpose, notes, badgeNumber } = req.body

    // Vérifier que le visiteur existe
    const visitor = await Visitor.findByPk(visitorId)
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visiteur non trouvé',
      })
    }

    // Vérifier que l\'employé hôte existe
    const employee = await Employee.findByPk(hostEmployeeId)
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé hôte non trouvé',
      })
    }

    const visit = await Visit.create({
      visitorId,
      hostEmployeeId,
      scheduledAt,
      purpose,
      notes,
      badgeNumber,
      status: 'expected',
    })

    logger.info(`Visite créée: ${visit.id} par ${req.user.matricule}`)

    res.status(201).json({
      success: true,
      message: 'Visite créée avec succès',
      data: { visit },
    })
  } catch (error) {
    logger.error('Erreur createVisit:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    })
  }
}

const checkIn = async (req, res) => {
  try {
    const { id } = req.params

    const visit = await Visit.findByPk(id)
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée',
      })
    }

    await visit.update({
      checkedInAt: new Date(),
      status: 'in_progress',
    })

    logger.info(`Check-in visite: ${id} par ${req.user.matricule}`)

    res.json({
      success: true,
      message: 'Check-in effectué',
      data: { visit },
    })
  } catch (error) {
    logger.error('Erreur checkIn:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    })
  }
}

const checkOut = async (req, res) => {
  try {
    const { id } = req.params

    const visit = await Visit.findByPk(id)
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée',
      })
    }

    await visit.update({
      checkedOutAt: new Date(),
      status: 'checked_out',
    })

    logger.info(`Check-out visite: ${id} par ${req.user.matricule}`)

    res.json({
      success: true,
      message: 'Check-out effectué',
      data: { visit },
    })
  } catch (error) {
    logger.error('Erreur checkOut:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    })
  }
}

module.exports = {
  getAllVisits,
  createVisit,
  checkIn,
  checkOut,
  // ... autres fonctions
}
```

#### Tâche 6.3: Créer package.controller.js

Similaire à visit.controller.js pour la gestion des colis/courriers.

### Jour 8: Routes et Middleware

#### Tâche 8.1: Créer visit.routes.js

**Fichier**: `backend/src/routes/visit.routes.js`

```javascript
const express = require('express')
const router = express.Router()
const { getAllVisits, createVisit, checkIn, checkOut } = require('../controllers/visit.controller')

router.get('/', getAllVisits)
router.post('/', createVisit)
router.put('/:id/check-in', checkIn)
router.put('/:id/check-out', checkOut)

module.exports = router
```

#### Tâche 8.2: Ajouter Routes dans server.js

```javascript
// Dans backend/src/server.js
const visitRoutes = require('./routes/visit.routes')
app.use('/api/visits', authMiddleware, visitRoutes)
```

### Jour 9-10: Controllers HSE et SOGARA Connect

Créer hse.controller.js et post.controller.js avec toutes les fonctions CRUD.

**Livrables Sprint 2:**

- ✅ 7 controllers complets
- ✅ 7 fichiers routes
- ✅ CRUD complet pour toutes les entités
- ✅ Tests manuels avec Postman
- ✅ Documentation API (README)

---

## 🔌 SPRINT 3: Intégration Frontend

**Durée**: 1 semaine (40h)  
**Objectif**: Connecter le frontend au backend

### Jour 11-12: Configuration et Authentification

#### Tâche 11.1: Créer Service API Frontend

**Fichier**: `src/services/api.service.ts`

```typescript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error),
)

// Intercepteur pour gérer le refresh token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
```

#### Tâche 11.2: Modifier AuthContext

Remplacer la simulation par des appels API réels.

**Fichier**: `src/contexts/AuthContext.tsx` (modifier)

```typescript
// Remplacer la fonction login
const login = async (email: string) => {
  try {
    setLoading(true)
    setError(null)

    const response = await apiClient.post('/auth/login', {
      matricule: email.split('@')[0].replace('.', '_').toUpperCase(),
      password: 'password_a_changer', // À adapter
    })

    const { user, accessToken, refreshToken } = response.data.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)
    setIsAuthenticated(true)

    toast.success(`Bienvenue ${user.firstName} !`)
  } catch (err: any) {
    const message = err.response?.data?.message || 'Erreur de connexion'
    setError(message)
    toast.error(message)
    throw err
  } finally {
    setLoading(false)
  }
}
```

### Jour 13-14: Remplacer Repositories par API

#### Tâche 13.1: Créer employeeAPI.service.ts

**Fichier**: `src/services/api/employeeAPI.service.ts`

```typescript
import apiClient from '../api.service'
import { Employee } from '@/types'

export const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/employees')
    return response.data.data.employees
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/employees/${id}`)
    return response.data.data.employee
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.post('/employees', data)
    return response.data.data.employee
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put(`/employees/${id}`, data)
    return response.data.data.employee
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`)
  },
}
```

#### Tâche 13.2: Adapter les Hooks

Modifier tous les hooks (useEmployee, useVisit, etc.) pour utiliser les services API au lieu des repositories.

**Exemple**: `src/hooks/useEmployees.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeAPI } from '@/services/api/employeeAPI.service'

export const useEmployees = () => {
  const queryClient = useQueryClient()

  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeAPI.getAll,
  })

  const createMutation = useMutation({
    mutationFn: employeeAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  return {
    employees,
    isLoading,
    error,
    createEmployee: createMutation.mutate,
  }
}
```

### Jour 15: Tests d'Intégration

#### Tâche 15.1: Tests Manuels Complets

Tester tous les workflows principaux:

- Authentification
- CRUD employés
- Gestion visites
- Gestion colis
- Module HSE

#### Tâche 15.2: Correction Bugs

Corriger tous les bugs trouvés pendant les tests.

**Livrables Sprint 3:**

- ✅ Frontend connecté au backend
- ✅ Authentification JWT fonctionnelle
- ✅ Tous les repositories remplacés par API
- ✅ Tests d'intégration passés
- ✅ 0 erreur console

---

## 🚀 SPRINT 4: Services Avancés

**Durée**: 1 semaine (40h)  
**Objectif**: Uploads, IA backend, notifications

### Jour 16: Upload Fichiers

#### Tâche 16.1: Configurer Multer

**Fichier**: `backend/src/middleware/upload.middleware.js` (modifier)

```javascript
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configuration stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.UPLOAD_ALLOWED_TYPES.split(',')
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Type de fichier non autorisé'))
    }
  },
})

module.exports = upload
```

#### Tâche 16.2: Route Upload

**Fichier**: `backend/src/routes/upload.routes.js` (créer)

```javascript
const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload.middleware')

router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier uploadé',
    })
  }

  res.json({
    success: true,
    message: 'Fichier uploadé avec succès',
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
    },
  })
})

module.exports = router
```

### Jour 17-18: Services IA Backend

#### Tâche 17.1: Créer Service IA Backend

**Fichier**: `backend/src/services/ai.service.js` (créer)

```javascript
const OpenAI = require('openai')
const logger = require('../utils/logger')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const extractDocumentData = async (imageBase64, documentType) => {
  try {
    let prompt = ''

    switch (documentType) {
      case 'identity':
        prompt = `Analyse cette pièce d'identité et extrait les informations suivantes en JSON:
        {
          "firstName": "",
          "lastName": "",
          "idNumber": "",
          "birthDate": "",
          "nationality": "",
          "documentType": "cin|passport|other"
        }`
        break

      case 'package':
        prompt = `Analyse cette étiquette de colis et extrait:
        {
          "trackingNumber": "",
          "sender": "",
          "recipient": "",
          "service": "",
          "weight": "",
          "urgent": boolean
        }`
        break

      case 'mail':
        prompt = `Effectue l'OCR de ce courrier et extrait:
        {
          "text": "texte complet",
          "summary": "résumé en 2-3 phrases",
          "keywords": ["mot1", "mot2"],
          "sender": "",
          "date": "",
          "isConfidential": boolean
        }`
        break
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageBase64 },
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    const result = JSON.parse(response.choices[0].message.content)

    logger.info(`Extraction IA réussie - Type: ${documentType}`)

    return {
      success: true,
      data: result,
      confidence: 0.95,
    }
  } catch (error) {
    logger.error('Erreur extraction IA:', error)
    throw error
  }
}

module.exports = {
  extractDocumentData,
}
```

#### Tâche 17.2: Routes IA

**Fichier**: `backend/src/routes/ai.routes.js` (créer)

```javascript
const express = require('express')
const router = express.Router()
const { extractDocumentData } = require('../services/ai.service')

router.post('/extract', async (req, res) => {
  try {
    const { image, documentType } = req.body

    if (!image || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Image et type de document requis',
      })
    }

    const result = await extractDocumentData(image, documentType)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur extraction IA',
    })
  }
})

module.exports = router
```

### Jour 19-20: Notifications et Email

#### Tâche 19.1: Service Email

**Fichier**: `backend/src/services/email.service.js` (créer)

```javascript
const nodemailer = require('nodemailer')
const logger = require('../utils/logger')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })

    logger.info(`Email envoyé: ${info.messageId}`)
    return true
  } catch (error) {
    logger.error('Erreur envoi email:', error)
    return false
  }
}

const sendVisitNotification = async (visit, employee) => {
  const html = `
    <h2>Nouvelle Visite Programmée</h2>
    <p>Bonjour ${employee.firstName},</p>
    <p>Une visite a été programmée:</p>
    <ul>
      <li>Visiteur: ${visit.visitor.firstName} ${visit.visitor.lastName}</li>
      <li>Date: ${new Date(visit.scheduledAt).toLocaleString('fr-FR')}</li>
      <li>Objet: ${visit.purpose}</li>
    </ul>
  `

  return sendEmail(employee.email, 'Nouvelle visite programmée', html)
}

module.exports = {
  sendEmail,
  sendVisitNotification,
  // ... autres templates
}
```

**Livrables Sprint 4:**

- ✅ Upload fichiers fonctionnel
- ✅ Services IA déplacés côté backend
- ✅ API keys sécurisées
- ✅ Notifications email configurées
- ✅ Socket.IO notifications temps réel

---

## ✅ SPRINT 5: Tests et Déploiement

**Durée**: 1 semaine (40h)  
**Objectif**: Tests, documentation, déploiement

### Jour 21-22: Tests

#### Tests Unitaires

- Jest pour backend
- Vitest pour frontend

#### Tests d'Intégration

- Supertest pour API
- React Testing Library

#### Tests End-to-End

- Playwright ou Cypress

### Jour 23-24: Documentation

- Documentation API (Swagger/OpenAPI)
- README technique
- Guide déploiement

### Jour 25: Déploiement

#### Backend

- Heroku, Railway, ou VPS
- Configuration PostgreSQL production
- Variables d'environnement

#### Frontend

- Netlify, Vercel, ou AWS S3
- Configuration build production
- Connexion au backend

**Livrables Sprint 5:**

- ✅ Tests unitaires >80% couverture
- ✅ Tests e2e principaux workflows
- ✅ Documentation complète
- ✅ Application déployée
- ✅ Monitoring configuré

---

## 📊 RÉSUMÉ DU PLAN

### Durée Totale

**4 semaines** (20 jours ouvrés, 160h)

### Sprints

1. **Sprint 1** (1 semaine): Fondations Backend
2. **Sprint 2** (1 semaine): API Core
3. **Sprint 3** (1 semaine): Intégration Frontend
4. **Sprint 4** (1 semaine): Services Avancés
5. **Sprint 5** (1 semaine): Tests & Déploiement

### Livrables Finaux

- ✅ Backend complet et fonctionnel
- ✅ Base de données PostgreSQL en production
- ✅ Frontend connecté au backend
- ✅ Authentification JWT sécurisée
- ✅ Upload fichiers opérationnel
- ✅ Services IA backend
- ✅ Notifications email et temps réel
- ✅ Tests automatisés
- ✅ Documentation complète
- ✅ Application déployée

---

## 🎯 CRITÈRES DE SUCCÈS

### Technique

- [ ] Backend répond sur toutes les routes
- [ ] Base de données fonctionne en production
- [ ] Frontend communique avec backend
- [ ] Uploads fonctionnent
- [ ] IA extractions fonctionnent
- [ ] Tests passent à >80%

### Fonctionnel

- [ ] Authentification fonctionne
- [ ] CRUD toutes entités OK
- [ ] Module HSE opérationnel
- [ ] Système IA opérationnel
- [ ] Notifications fonctionnent
- [ ] Multi-utilisateurs OK

### Qualité

- [ ] 0 erreur console
- [ ] Performance <2s chargement
- [ ] Sécurité validée
- [ ] Code documenté
- [ ] Déployé accessible

---

_Plan d'implémentation - Version 1.0 - 9 Octobre 2025_
