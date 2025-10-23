# 🚀 Guide Complet d'Accès au Serveur Backend SOGARA

## 📋 Table des Matières
1. [Configuration Initiale](#configuration-initiale)
2. [Variables d'Environnement](#variables-denvironnement)
3. [Démarrage du Serveur](#démarrage-du-serveur)
4. [Endpoints API Disponibles](#endpoints-api-disponibles)
5. [Tests avec Cursor/cURL](#tests-avec-cursorcurl)
6. [Base de Données PostgreSQL](#base-de-données-postgresql)

---

## 🔧 Configuration Initiale

### 1. Installation des Dépendances

```bash
cd backend
npm install
```

### 2. Configuration de la Base de Données PostgreSQL

```bash
# Installer PostgreSQL (si pas déjà fait)
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Créer la base de données
psql postgres
CREATE DATABASE sogara_db;
CREATE USER sogara_user WITH ENCRYPTED PASSWORD 'sogara_password';
GRANT ALL PRIVILEGES ON DATABASE sogara_db TO sogara_user;
\q
```

---

## 🔐 Variables d'Environnement

Créez un fichier `backend/.env` avec le contenu suivant :

```env
# ======================
# CONFIGURATION SERVEUR
# ======================
NODE_ENV=development
PORT=3001

# ======================
# BASE DE DONNÉES
# ======================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sogara_db
DB_USER=sogara_user
DB_PASSWORD=sogara_password

# Production (optionnel)
DATABASE_URL=postgresql://user:password@host:5432/database

# ======================
# JWT SECRETS (CRITIQUES)
# ======================
# Générez des secrets forts avec: openssl rand -base64 32
JWT_ACCESS_SECRET=votre_secret_access_token_minimum_32_caracteres_aleatoires
JWT_REFRESH_SECRET=votre_secret_refresh_token_minimum_32_caracteres_differents
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ======================
# CORS
# ======================
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ======================
# RATE LIMITING
# ======================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ======================
# UPLOADS
# ======================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# ======================
# EMAIL (optionnel)
# ======================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
```

### ⚠️ Génération de Secrets JWT Sécurisés

```bash
# Générer deux secrets différents
openssl rand -base64 32  # Pour JWT_ACCESS_SECRET
openssl rand -base64 32  # Pour JWT_REFRESH_SECRET
```

---

## 🚀 Démarrage du Serveur

### Mode Développement (avec auto-reload)
```bash
cd backend
npm run dev
```

### Mode Production
```bash
cd backend
npm start
```

### Migration et Seed de la Base de Données
```bash
# Créer les tables
npm run migrate

# Insérer des données de test
npm run seed
```

Le serveur démarre sur : **http://localhost:3001**

---

## 📡 Endpoints API Disponibles

### 🔓 Endpoints Publics (sans authentification)

#### 1. Health Check
```bash
GET http://localhost:3001/health
```

**Réponse :**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "database": "connected",
    "server": "running"
  },
  "uptime": 12345,
  "memory": {...}
}
```

#### 2. Info API
```bash
GET http://localhost:3001/
```

---

### 🔐 Authentification (`/api/auth`)

#### Connexion
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "matricule": "HSE001",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "matricule": "HSE001",
      "firstName": "Aminata",
      "lastName": "Diallo",
      "roles": ["HSE", "ADMIN"]
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### Enregistrement (Admin seulement)
```bash
POST http://localhost:3001/api/auth/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "matricule": "EMP999",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@sogara.ga",
  "password": "password123",
  "service": "PRODUCTION",
  "roles": ["EMPLOYE"]
}
```

#### Refresh Token
```bash
POST http://localhost:3001/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Déconnexion
```bash
POST http://localhost:3001/api/auth/logout
Authorization: Bearer <access_token>
```

#### Changer le Mot de Passe
```bash
POST http://localhost:3001/api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

#### Valider Token
```bash
GET http://localhost:3001/api/auth/validate
Authorization: Bearer <access_token>
```

#### Obtenir le Profil
```bash
GET http://localhost:3001/api/auth/profile
Authorization: Bearer <access_token>
```

---

### 👥 Employés (`/api/employees`)

**Toutes les routes nécessitent authentification**

#### Lister les Employés
```bash
GET http://localhost:3001/api/employees
Authorization: Bearer <access_token>
```

#### Obtenir un Employé
```bash
GET http://localhost:3001/api/employees/:id
Authorization: Bearer <access_token>
```

#### Créer un Employé (Admin)
```bash
POST http://localhost:3001/api/employees
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "matricule": "EMP100",
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie.martin@sogara.ga",
  "service": "RH",
  "roles": ["EMPLOYE"],
  "status": "active"
}
```

#### Mettre à Jour un Employé
```bash
PUT http://localhost:3001/api/employees/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Marie Updated",
  "status": "inactive"
}
```

#### Supprimer un Employé (Admin)
```bash
DELETE http://localhost:3001/api/employees/:id
Authorization: Bearer <access_token>
```

---

### 🚪 Visites (`/api/visits`)

**Routes à créer - voir server.js ligne 160**

---

### 📦 Colis/Courrier (`/api/packages`)

**Routes à créer - voir server.js ligne 161**

---

### 🔧 Équipements (`/api/equipment`)

**Routes à créer - voir server.js ligne 162**

---

### 🦺 HSE (`/api/hse`)

**Routes à créer - voir server.js ligne 163**

---

### 📰 Publications (`/api/posts`)

**Routes à créer - voir server.js ligne 164**

---

### 📤 Upload de Fichiers (`/api/upload`)

```bash
POST http://localhost:3001/api/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: [fichier]
```

---

## 🧪 Tests avec Cursor/cURL

### Exemple Complet : Workflow d'Authentification

```bash
# 1. Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "HSE001",
    "password": "password123"
  }'

# Sauvegardez le accessToken de la réponse
export TOKEN="eyJhbGc..."

# 2. Obtenir le profil
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Lister les employés
curl -X GET http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN"

# 4. Créer un employé (Admin)
curl -X POST http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "TEST001",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@sogara.ga",
    "service": "IT",
    "roles": ["EMPLOYE"]
  }'

# 5. Déconnexion
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💾 Base de Données PostgreSQL

### Accès Direct à la Base

```bash
# Connexion
psql -U sogara_user -d sogara_db -h localhost

# Lister les tables
\dt

# Voir les employés
SELECT * FROM employees;

# Voir les rôles d'un employé
SELECT * FROM employees WHERE matricule = 'HSE001';

# Sortir
\q
```

### Tables Principales

- **employees** : Tous les employés avec leurs informations
- **visits** : Gestion des visites (à créer)
- **packages** : Colis et courrier (à créer)
- **equipment** : Équipements HSE (à créer)
- **hse_trainings** : Formations HSE (à créer)
- **hse_incidents** : Incidents HSE (à créer)

---

## 🔌 WebSocket (Socket.IO)

Le serveur supporte Socket.IO pour les notifications temps réel.

### Connexion depuis le Frontend

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  withCredentials: true
});

// Authentification
socket.emit('authenticate', {
  userId: 'user-id',
  token: 'access-token'
});

// Écouter les notifications
socket.on('notification', (data) => {
  console.log('Notification reçue:', data);
});
```

---

## 📊 Logs et Débogage

Les logs sont gérés par Winston et s'affichent dans la console :

```bash
# Logs en temps réel
npm run dev

# Voir uniquement les erreurs
npm run dev | grep ERROR

# Voir uniquement les requêtes
npm run dev | grep HTTP
```

---

## 🔒 Permissions par Rôle

| Rôle | Permissions |
|------|------------|
| **ADMIN** | Toutes les permissions système |
| **HSE** | Gestion HSE, employés, équipements |
| **SUPERVISEUR** | Gestion visites, équipements, consultation employés |
| **RECEP** | Gestion visites, colis, courrier |
| **COMMUNICATION** | Gestion publications |
| **EMPLOYE** | Consultation propres données uniquement |

Voir `backend/src/middleware/auth.middleware.js` pour les détails.

---

## 🆘 Résolution de Problèmes

### Erreur : "Cannot connect to database"
```bash
# Vérifier que PostgreSQL tourne
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Tester la connexion
psql -U sogara_user -d sogara_db -h localhost
```

### Erreur : "Token invalide"
```bash
# Vérifiez que JWT_ACCESS_SECRET est défini dans .env
# Régénérez un token en vous reconnectant
```

### Erreur : "Port 3001 already in use"
```bash
# Trouver le processus
lsof -i :3001

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=3002
```

---

## 📚 Ressources Utiles

- **Documentation Express** : https://expressjs.com/
- **Sequelize ORM** : https://sequelize.org/
- **JWT** : https://jwt.io/
- **Socket.IO** : https://socket.io/docs/

---

## ✅ Checklist de Démarrage

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `sogara_db` créée
- [ ] Fichier `.env` configuré avec secrets JWT
- [ ] Dépendances installées (`npm install`)
- [ ] Migrations exécutées (`npm run migrate`)
- [ ] Serveur démarré (`npm run dev`)
- [ ] Test du endpoint `/health` réussi
- [ ] Connexion avec un compte test réussie

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-10-23  
**Contact:** SOGARA Team
