# 🚀 Démarrage Rapide SOGARA Backend

## ⚡ Démarrage en 5 Minutes

### 1. Configuration Initiale
```bash
# Cloner et naviguer vers le backend
cd backend

# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env
```

### 2. Configuration PostgreSQL (Optionnel)
```bash
# Démarrer PostgreSQL
brew services start postgresql  # macOS
# ou
sudo systemctl start postgresql  # Linux

# Créer la base de données
psql postgres
CREATE DATABASE sogara_db;
CREATE USER sogara_user WITH PASSWORD 'sogara_password';
GRANT ALL PRIVILEGES ON DATABASE sogara_db TO sogara_user;
\q
```

### 3. Lancement du Serveur

#### Mode Simple (Recommandé pour le développement)
```bash
# Démarrer le serveur simple
npm run backend:start
```

#### Mode Complet (Avec base de données)
```bash
# Migrations et données de test
npm run migrate
npm run seed

# Démarrer en mode développement
npm run backend:dev
```

### 4. Vérification
```bash
# Test de santé
curl http://localhost:3001/health

# Test des API
curl http://localhost:3001/api/analytics/dashboard
```

## 🎯 Endpoints Principaux

| Endpoint | Description | Méthode |
|----------|-------------|---------|
| `/health` | État du serveur | GET |
| `/api/analytics/dashboard` | Données analytiques | GET |
| `/api/approval/workflows` | Workflows d'approbation | GET |
| `/api/approval/pending` | Étapes en attente | GET |
| `/api/posts` | Posts/Actualités | GET |

## 🔧 Configuration Rapide

### Variables d'Environnement Essentielles
```bash
# .env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### JWT Secrets (Génération automatique)
```bash
# Générer des secrets sécurisés
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

## 🚨 Dépannage Express

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3001

# Tuer le processus
kill -9 PID
```

### Erreur de base de données
```bash
# Mode simple (sans DB)
node simple-server.js
```

### Erreurs CORS
```bash
# Vérifier l'origine frontend
echo $CORS_ORIGIN
```

## 📊 Test des API

### Script de Test Automatique
```bash
#!/bin/bash
echo "🧪 Test des API SOGARA..."

# Health Check
echo "1. Health Check..."
curl -s http://localhost:3001/health | jq

# Analytics
echo "2. Analytics Dashboard..."
curl -s http://localhost:3001/api/analytics/dashboard | jq

# Workflows
echo "3. Workflows..."
curl -s http://localhost:3001/api/approval/workflows | jq

# Pending
echo "4. Pending Steps..."
curl -s http://localhost:3001/api/approval/pending | jq

# Posts
echo "5. Posts..."
curl -s http://localhost:3001/api/posts | jq

echo "✅ Tests terminés!"
```

## 🔌 WebSocket Test

### Connexion WebSocket
```javascript
// Test dans la console du navigateur
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('✅ Connecté'));
socket.on('disconnect', () => console.log('❌ Déconnecté'));
```

## 📱 Intégration Frontend

### Configuration Frontend
```javascript
// src/services/api.service.ts
const API_CONFIG = {
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
};
```

### Test de Connexion
```javascript
// Test de connectivité
fetch('http://localhost:3001/health')
  .then(res => res.json())
  .then(data => console.log('Backend:', data));
```

## 🎉 Succès!

Si vous voyez ce message, le serveur fonctionne :
```json
{
  "status": "OK",
  "timestamp": "2025-10-24T09:55:14.296Z",
  "version": "1.0.0",
  "environment": "development"
}
```

## 📚 Prochaines Étapes

1. **Frontend**: Démarrer le frontend avec `npm run dev`
2. **Convex**: Démarrer Convex avec `npm run dev:convex`
3. **Tests**: Exécuter les tests avec `npm test`
4. **Documentation**: Consulter `GUIDE-ACCES-SERVEUR.md`

## 🆘 Support

- **Logs**: `tail -f logs/sogara.log`
- **Debug**: `LOG_LEVEL=debug npm run backend:start`
- **Documentation**: Voir `GUIDE-ACCES-SERVEUR.md`

---

**Note**: Le serveur simple fonctionne sans base de données et fournit des données de démonstration pour le développement.