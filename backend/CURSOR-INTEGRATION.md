# 🔌 Intégration Backend SOGARA avec Cursor

## 📋 Guide pour Développer avec Cursor

### 🎯 Configuration Cursor pour API Backend

#### 1. Extension REST Client (Recommandée)

Installez l'extension **REST Client** dans Cursor/VSCode :
- Appuyez sur `Cmd+Shift+X` (macOS) ou `Ctrl+Shift+X` (Windows/Linux)
- Recherchez "REST Client"
- Installez l'extension de Huachao Mao

#### 2. Créer un Fichier de Requêtes

Créez `backend/api-tests.http` :

```http
### Variables
@baseUrl = http://localhost:3001
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Health Check
GET {{baseUrl}}/health

### Login - Obtenir un token
# @name login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "matricule": "HSE001",
  "password": "password123"
}

### Sauvegarder le token (après login)
@authToken = {{login.response.body.$.data.tokens.accessToken}}

### Get Profile
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{authToken}}

### List Employees
GET {{baseUrl}}/api/employees
Authorization: Bearer {{authToken}}

### Create Employee (Admin only)
POST {{baseUrl}}/api/employees
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "matricule": "TEST999",
  "firstName": "Test",
  "lastName": "Cursor",
  "email": "test.cursor@sogara.ga",
  "service": "IT",
  "roles": ["EMPLOYE"]
}

### Get Specific Employee
GET {{baseUrl}}/api/employees/{{employeeId}}
Authorization: Bearer {{authToken}}

### Update Employee
PUT {{baseUrl}}/api/employees/{{employeeId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "firstName": "Updated Name"
}

### Delete Employee (Admin only)
DELETE {{baseUrl}}/api/employees/{{employeeId}}
Authorization: Bearer {{authToken}}

### Change Password
POST {{baseUrl}}/api/auth/change-password
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}

### Refresh Token
POST {{baseUrl}}/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}

### Logout
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer {{authToken}}
```

**Utilisation :**
- Cliquez sur "Send Request" au-dessus de chaque bloc
- Les réponses s'affichent dans un panel à droite
- Les variables `@token` sont automatiquement extraites des réponses

---

## 🛠️ Scripts Cursor pour Automatisation

### Script de Test Complet

Créez `backend/scripts/test-api.sh` :

```bash
#!/bin/bash

# Couleurs pour la sortie
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo -e "${YELLOW}🧪 Tests API SOGARA Backend${NC}\n"

# 1. Health Check
echo -e "${YELLOW}1. Health Check...${NC}"
HEALTH=$(curl -s ${BASE_URL}/health)
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  echo -e "${GREEN}✅ Health check OK${NC}\n"
else
  echo -e "${RED}❌ Health check failed${NC}\n"
  exit 1
fi

# 2. Login
echo -e "${YELLOW}2. Login (HSE001)...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"matricule":"HSE001","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}\n"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo -e "Token: ${TOKEN:0:20}...\n"

# 3. Get Profile
echo -e "${YELLOW}3. Get Profile...${NC}"
PROFILE=$(curl -s ${BASE_URL}/api/auth/profile \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q '"matricule"'; then
  echo -e "${GREEN}✅ Profile retrieved${NC}"
  echo "$PROFILE" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4
  echo ""
else
  echo -e "${RED}❌ Failed to get profile${NC}\n"
  exit 1
fi

# 4. List Employees
echo -e "${YELLOW}4. List Employees...${NC}"
EMPLOYEES=$(curl -s ${BASE_URL}/api/employees \
  -H "Authorization: Bearer $TOKEN")

if echo "$EMPLOYEES" | grep -q '"matricule"'; then
  EMPLOYEE_COUNT=$(echo "$EMPLOYEES" | grep -o '"matricule"' | wc -l)
  echo -e "${GREEN}✅ Employees listed: $EMPLOYEE_COUNT employees${NC}\n"
else
  echo -e "${RED}❌ Failed to list employees${NC}\n"
  exit 1
fi

# 5. Validate Token
echo -e "${YELLOW}5. Validate Token...${NC}"
VALIDATE=$(curl -s ${BASE_URL}/api/auth/validate \
  -H "Authorization: Bearer $TOKEN")

if echo "$VALIDATE" | grep -q '"valid":true'; then
  echo -e "${GREEN}✅ Token is valid${NC}\n"
else
  echo -e "${RED}❌ Token validation failed${NC}\n"
  exit 1
fi

echo -e "${GREEN}🎉 All tests passed!${NC}"
```

**Rendre le script exécutable :**
```bash
chmod +x backend/scripts/test-api.sh
./backend/scripts/test-api.sh
```

---

## 🔍 Débogage dans Cursor

### Configuration VSCode/Cursor Debugger

Créez `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.js",
      "cwd": "${workspaceFolder}/backend",
      "envFile": "${workspaceFolder}/backend/.env",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "runtimeArgs": ["--inspect"],
      "sourceMaps": true
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Backend",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Utilisation :**
1. Appuyez sur `F5` pour démarrer le débogueur
2. Placez des breakpoints dans le code (clic gauche sur la marge)
3. Le serveur se relance automatiquement à chaque modification

---

## 🔧 Extensions Cursor Recommandées

1. **REST Client** - Tester les API directement dans l'éditeur
2. **Thunder Client** - Alternative graphique à Postman
3. **Database Client** - Visualiser PostgreSQL
4. **Error Lens** - Voir les erreurs inline
5. **Pretty TypeScript Errors** - Erreurs TypeScript lisibles

---

## 📝 Snippets Cursor Utiles

Créez `.vscode/snippets.code-snippets` :

```json
{
  "Express Route": {
    "prefix": "exp-route",
    "body": [
      "/**",
      " * @route   ${1|GET,POST,PUT,DELETE,PATCH|} /api/${2:resource}",
      " * @desc    ${3:Description}",
      " * @access  ${4|Public,Private,Admin|}",
      " */",
      "router.${1:get}('/${2:resource}', ${5:authMiddleware}, async (req, res) => {",
      "  try {",
      "    $0",
      "    res.json({ success: true, data: {} });",
      "  } catch (error) {",
      "    logger.error('Error:', error);",
      "    res.status(500).json({ success: false, message: error.message });",
      "  }",
      "});"
    ],
    "description": "Create Express route"
  },
  "Sequelize Model": {
    "prefix": "seq-model",
    "body": [
      "const { Model, DataTypes } = require('sequelize');",
      "const { sequelize } = require('../config/database');",
      "",
      "class ${1:ModelName} extends Model {}",
      "",
      "${1:ModelName}.init(",
      "  {",
      "    id: {",
      "      type: DataTypes.UUID,",
      "      defaultValue: DataTypes.UUIDV4,",
      "      primaryKey: true",
      "    },",
      "    ${2:fieldName}: {",
      "      type: DataTypes.${3|STRING,INTEGER,BOOLEAN,DATE|},",
      "      allowNull: ${4|false,true|}",
      "    }",
      "  },",
      "  {",
      "    sequelize,",
      "    modelName: '${1:ModelName}',",
      "    tableName: '${5:table_name}',",
      "    timestamps: true",
      "  }",
      ");",
      "",
      "module.exports = { ${1:ModelName} };"
    ],
    "description": "Create Sequelize model"
  },
  "API Test Block": {
    "prefix": "api-test",
    "body": [
      "### ${1:Test Name}",
      "${2|GET,POST,PUT,DELETE,PATCH|} {{baseUrl}}/api/${3:endpoint}",
      "Authorization: Bearer {{authToken}}",
      "Content-Type: application/json",
      "",
      "{",
      "  \"${4:key}\": \"${5:value}\"",
      "}",
      ""
    ],
    "description": "Create API test block"
  }
}
```

**Utilisation :** Tapez `exp-route` puis `Tab` pour générer une route Express complète.

---

## 🧪 Tests Automatisés avec Jest

### Exemple de Test API

Créez `backend/tests/auth.test.js` :

```javascript
const request = require('supertest');
const { app } = require('../src/server');

describe('Authentication API', () => {
  let accessToken;

  test('POST /api/auth/login - Should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        matricule: 'HSE001',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.accessToken).toBeDefined();

    accessToken = response.body.data.tokens.accessToken;
  });

  test('GET /api/auth/profile - Should get profile with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.matricule).toBe('HSE001');
  });

  test('GET /api/auth/profile - Should fail without token', async () => {
    const response = await request(app)
      .get('/api/auth/profile');

    expect(response.status).toBe(401);
  });
});
```

**Lancer les tests :**
```bash
npm test
npm test -- --watch  # Mode watch
npm test -- --coverage  # Avec couverture
```

---

## 🚀 Workflow de Développement dans Cursor

### 1. Terminal Intégré (Recommandé)

Ouvrez 3 terminaux dans Cursor (`Ctrl+Shift+` \`):

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Tests/Commandes:**
```bash
# Tests API
./backend/scripts/test-api.sh

# Accès PostgreSQL
psql -U sogara_user -d sogara_db

# Logs en temps réel
tail -f backend/logs/sogara.log
```

### 2. Tasks Cursor

Créez `.vscode/tasks.json` :

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "cd backend && npm run dev",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Test API",
      "type": "shell",
      "command": "./backend/scripts/test-api.sh",
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      }
    },
    {
      "label": "Reset Database",
      "type": "shell",
      "command": "cd backend && npm run migrate && npm run seed",
      "problemMatcher": []
    }
  ]
}
```

**Utilisation :** `Cmd+Shift+P` → "Tasks: Run Task"

---

## 📊 Monitoring avec Cursor

### Extension Database Client

1. Installer "Database Client" dans Cursor
2. Connecter PostgreSQL :
   - Host: `localhost`
   - Port: `5432`
   - Database: `sogara_db`
   - User: `sogara_user`
   - Password: `sogara_password`

3. Visualiser les tables en temps réel
4. Exécuter des requêtes SQL directement

---

## 🔐 Gestion des Secrets

### Fichier .env local (non commité)

```bash
# Ne JAMAIS commiter le .env
echo ".env" >> backend/.gitignore

# Utiliser .env.example comme template
cp backend/.env.example backend/.env

# Générer des secrets uniques
openssl rand -base64 32 > backend/.secrets/jwt_access
openssl rand -base64 32 > backend/.secrets/jwt_refresh
```

---

## 📚 Commandes Cursor Rapides

| Commande | Raccourci | Description |
|----------|-----------|-------------|
| Palette de commandes | `Cmd+Shift+P` | Accès à toutes les commandes |
| Terminal intégré | `Ctrl+` \` | Ouvrir/fermer terminal |
| Recherche globale | `Cmd+Shift+F` | Chercher dans tous les fichiers |
| Débogage | `F5` | Démarrer le débogueur |
| Tester API | Clic "Send Request" | Dans fichiers `.http` |

---

**✅ Votre environnement Cursor est maintenant configuré pour le développement backend SOGARA !**
