# ⚡ Quick Start - Serveur Backend SOGARA

## 🚀 Démarrage Rapide en 5 Minutes

### 1️⃣ Installation PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2️⃣ Création de la Base de Données

```bash
# Connexion à PostgreSQL
psql postgres

# Dans psql, exécutez:
CREATE DATABASE sogara_db;
CREATE USER sogara_user WITH ENCRYPTED PASSWORD 'sogara_password';
GRANT ALL PRIVILEGES ON DATABASE sogara_db TO sogara_user;
\q
```

### 3️⃣ Configuration

```bash
cd backend

# Copier le fichier .env d'exemple
cp .env.example .env

# Générer des secrets JWT sécurisés
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 32)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env

# Installer les dépendances
npm install
```

### 4️⃣ Lancement

```bash
# Créer les tables
npm run migrate

# Insérer des données de test
npm run seed

# Démarrer le serveur
npm run dev
```

✅ **Le serveur tourne sur http://localhost:3001**

---

## 🧪 Premier Test

```bash
# Test de santé
curl http://localhost:3001/health

# Connexion avec un compte test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "HSE001",
    "password": "password123"
  }'
```

---

## 📝 Comptes de Test (après seed)

| Matricule | Mot de passe | Rôle | Nom |
|-----------|--------------|------|-----|
| HSE001 | password123 | HSE, ADMIN | Aminata Diallo |
| SUP001 | password123 | SUPERVISEUR | Pierre Bekale |
| REC001 | password123 | RECEP | Jean-Luc Bernard |
| EMP001 | password123 | EMPLOYE | Aïcha Ndiaye |

---

## 🔧 Commandes Utiles

```bash
# Mode développement (auto-reload)
npm run dev

# Mode production
npm start

# Tests
npm test

# Linting
npm run lint
npm run lint:fix
```

---

## 📚 Documentation Complète

Voir **GUIDE-ACCES-SERVEUR.md** pour :
- Tous les endpoints API
- Exemples cURL complets
- Permissions par rôle
- WebSocket/Socket.IO
- Troubleshooting

---

## 🆘 Problèmes Courants

**Port déjà utilisé?**
```bash
# Changer le port dans .env
PORT=3002
```

**PostgreSQL ne démarre pas?**
```bash
# macOS
brew services restart postgresql@15

# Linux
sudo systemctl restart postgresql
```

**Erreur "Cannot find module"?**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

**🎯 Prêt à coder!** Le serveur backend SOGARA est maintenant opérationnel.
