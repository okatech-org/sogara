# 🚀 Guide Complet - Accès Serveur SOGARA

## 📋 Table des Matières
1. [Configuration Initiale](#configuration-initiale)
2. [Endpoints API](#endpoints-api)
3. [Configuration PostgreSQL](#configuration-postgresql)
4. [Variables d'Environnement](#variables-denvironnement)
5. [WebSocket/Socket.IO](#websocketsocketio)
6. [Permissions par Rôle](#permissions-par-rôle)
7. [Exemples cURL](#exemples-curl)
8. [Dépannage](#dépannage)

## 🔧 Configuration Initiale

### Prérequis
- Node.js >= 18.0.0
- PostgreSQL >= 12 (optionnel pour le mode simple)
- npm ou yarn

### Installation
```bash
cd backend
npm install
cp .env.example .env
```

## 🌐 Endpoints API

### Health Check
```http
GET /health
```
**Description**: Vérification de l'état du serveur
**Réponse**:
```json
{
  "status": "OK",
  "timestamp": "2025-10-24T09:55:14.296Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### Analytics Dashboard
```http
GET /api/analytics/dashboard?period=week&department=all
```
**Description**: Données analytiques du tableau de bord
**Paramètres**:
- `period`: week, month, quarter, year
- `department`: all, hse, rh, admin

**Réponse**:
```json
{
  "success": true,
  "data": {
    "kpis": [
      {
        "label": "Visiteurs aujourd'hui",
        "value": 12,
        "trend": { "changePercent": 8.5 }
      }
    ],
    "charts": {
      "visitors": {
        "labels": ["Lun", "Mar", "Mer", "Jeu", "Ven"],
        "data": [8, 12, 15, 10, 14]
      }
    }
  }
}
```

### Workflows d'Approbation
```http
GET /api/approval/workflows
```
**Description**: Liste des workflows d'approbation

```http
GET /api/approval/pending
```
**Description**: Étapes d'approbation en attente

### Posts/Actualités
```http
GET /api/posts
```
**Description**: Liste des posts/actualités

## 🗄️ Configuration PostgreSQL

### Installation PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configuration Base de Données
```sql
-- Connexion en tant que superutilisateur
psql postgres

-- Création de la base de données
CREATE DATABASE sogara_db;

-- Création de l'utilisateur
CREATE USER sogara_user WITH PASSWORD 'sogara_password';

-- Attribution des privilèges
GRANT ALL PRIVILEGES ON DATABASE sogara_db TO sogara_user;

-- Connexion à la base
\c sogara_db

-- Attribution des privilèges sur le schéma
GRANT ALL ON SCHEMA public TO sogara_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sogara_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sogara_user;
```

## 🔐 Variables d'Environnement

### Configuration Serveur
```bash
NODE_ENV=development
PORT=3001
```

### Base de Données PostgreSQL
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sogara_db
DB_USER=sogara_user
DB_PASSWORD=sogara_password
```

### JWT Secrets
```bash
JWT_SECRET=votre_secret_access_jwt_32_caracteres_minimum
JWT_REFRESH_SECRET=votre_secret_refresh_jwt_32_caracteres_minimum
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### CORS
```bash
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Uploads
```bash
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🔌 WebSocket/Socket.IO

### Configuration
Le serveur utilise Socket.IO pour les notifications temps réel.

**Connexion**:
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Événements Écoutés
- `notification`: Notifications générales
- `hse_alert`: Alertes HSE
- `visit_update`: Mises à jour de visites
- `package_update`: Mises à jour de colis

### Événements Émis
- `join_room`: Rejoindre une salle
- `leave_room`: Quitter une salle
- `send_notification`: Envoyer une notification

## 👥 Permissions par Rôle

### Rôles Disponibles
- `ADMIN`: Accès complet
- `DG`: Directeur Général
- `HSE`: Responsable HSE
- `DRH`: Directeur RH
- `SUPERVISEUR`: Superviseur
- `COMPLIANCE`: Conformité
- `RECEP`: Réception
- `EMPLOYEE`: Employé

### Matrice de Permissions

| Endpoint | ADMIN | DG | HSE | DRH | SUPERVISEUR | COMPLIANCE | RECEP | EMPLOYEE |
|----------|-------|----|----|----|------------|------------|-------|----------|
| `/api/analytics/*` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/approval/*` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/api/posts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📡 Exemples cURL

### Health Check
```bash
curl -X GET http://localhost:3001/health
```

### Analytics Dashboard
```bash
curl -X GET "http://localhost:3001/api/analytics/dashboard?period=week&department=all"
```

### Workflows d'Approbation
```bash
curl -X GET http://localhost:3001/api/approval/workflows
```

### Étapes en Attente
```bash
curl -X GET http://localhost:3001/api/approval/pending
```

### Posts
```bash
curl -X GET http://localhost:3001/api/posts
```

### Avec Authentification
```bash
curl -X GET http://localhost:3001/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Démarrage du Serveur

### Mode Simple (Sans Base de Données)
```bash
cd backend
node simple-server.js
```

### Mode Complet (Avec PostgreSQL)
```bash
cd backend
npm run migrate
npm run seed
npm run dev
```

## 🔍 Dépannage

### Erreurs Courantes

#### 1. Port déjà utilisé
```bash
# Vérifier les processus utilisant le port 3001
lsof -i :3001

# Tuer le processus
kill -9 PID
```

#### 2. Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
brew services list | grep postgresql

# Redémarrer PostgreSQL
brew services restart postgresql
```

#### 3. Erreurs JWT
```bash
# Vérifier les variables d'environnement
cat .env | grep JWT

# Régénérer les secrets
openssl rand -base64 32
```

#### 4. Erreurs CORS
```bash
# Vérifier la configuration CORS
echo $CORS_ORIGIN

# Ajouter l'origine frontend
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Logs de Débogage
```bash
# Activer les logs détaillés
LOG_LEVEL=debug

# Vérifier les logs
tail -f logs/sogara.log
```

### Test de Connectivité
```bash
# Test de base
curl -I http://localhost:3001/health

# Test avec timeout
curl --connect-timeout 5 http://localhost:3001/health

# Test des endpoints
curl -X GET http://localhost:3001/api/analytics/dashboard
```

## 📊 Monitoring

### Métriques Disponibles
- Temps de réponse des API
- Nombre de connexions WebSocket
- Utilisation mémoire
- Erreurs par endpoint

### Health Check Avancé
```bash
curl -X GET http://localhost:3001/health | jq
```

## 🔒 Sécurité

### Recommandations
1. **JWT Secrets**: Utilisez des secrets forts (32+ caractères)
2. **HTTPS**: Activez HTTPS en production
3. **Rate Limiting**: Configurez les limites appropriées
4. **CORS**: Limitez les origines autorisées
5. **Validation**: Validez toutes les entrées

### Variables de Production
```bash
NODE_ENV=production
JWT_SECRET=secret_production_ultra_securise_32_caracteres_minimum
CORS_ORIGIN=https://votre-domaine.com
```

## 📚 Ressources Supplémentaires

- [Documentation Express.js](https://expressjs.com/)
- [Documentation Socket.IO](https://socket.io/docs/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation JWT](https://jwt.io/)

---

**Note**: Ce guide couvre le mode simple du serveur. Pour le mode complet avec base de données, consultez la documentation PostgreSQL et les migrations.