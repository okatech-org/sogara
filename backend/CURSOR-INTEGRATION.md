# 🎯 Intégration Cursor - SOGARA Backend

## 📋 Table des Matières
1. [Configuration Cursor](#configuration-cursor)
2. [Fichiers .http](#fichiers-http)
3. [Scripts de Test](#scripts-de-test)
4. [Configuration Debugger](#configuration-debugger)
5. [Extensions Recommandées](#extensions-recommandées)
6. [Snippets de Code](#snippets-de-code)
7. [Tasks VSCode](#tasks-vscode)

## 🔧 Configuration Cursor

### Workspace Settings
Créez `.vscode/settings.json` :
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.http": "http",
    "*.rest": "http"
  },
  "http.proxy": "",
  "http.proxyStrictSSL": false,
  "rest-client.environmentVariables": {
    "local": {
      "baseUrl": "http://localhost:3001",
      "apiUrl": "http://localhost:3001/api"
    },
    "production": {
      "baseUrl": "https://api.sogara.ga",
      "apiUrl": "https://api.sogara.ga/api"
    }
  }
}
```

## 📡 Fichiers .http

### tests/api-tests.http
```http
### Variables
@baseUrl = http://localhost:3001
@apiUrl = {{baseUrl}}/api

### Health Check
GET {{baseUrl}}/health

### Analytics Dashboard
GET {{apiUrl}}/analytics/dashboard?period=week&department=all

### Workflows d'Approbation
GET {{apiUrl}}/approval/workflows

### Étapes en Attente
GET {{apiUrl}}/approval/pending

### Posts
GET {{apiUrl}}/posts

### Test avec Authentification
GET {{apiUrl}}/analytics/dashboard
Authorization: Bearer YOUR_JWT_TOKEN

### Test CORS
OPTIONS {{apiUrl}}/analytics/dashboard
Origin: http://localhost:5173
```

### tests/auth-tests.http
```http
### Variables
@baseUrl = http://localhost:3001
@apiUrl = {{baseUrl}}/api

### Login
POST {{apiUrl}}/auth/login
Content-Type: application/json

{
  "matricule": "HSE001",
  "password": "HSE123!"
}

### Register
POST {{apiUrl}}/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "matricule": "TEST001",
  "email": "test@sogara.ga",
  "password": "Test123!",
  "roles": ["EMPLOYEE"]
}

### Refresh Token
POST {{apiUrl}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}

### Validate Token
GET {{apiUrl}}/auth/validate
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Scripts de Test

### test-api.sh
```bash
#!/bin/bash
# Script de test automatisé pour les API SOGARA

echo "🧪 Test des API SOGARA Backend"
echo "================================"

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

# Fonction de test
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo "Testing: $description"
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ $description - Status: $response"
        cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
    else
        echo "❌ $description - Status: $response (Expected: $expected_status)"
    fi
    echo ""
}

# Tests
test_endpoint "$BASE_URL/health" "Health Check"
test_endpoint "$API_URL/analytics/dashboard" "Analytics Dashboard"
test_endpoint "$API_URL/approval/workflows" "Approval Workflows"
test_endpoint "$API_URL/approval/pending" "Pending Steps"
test_endpoint "$API_URL/posts" "Posts"

echo "🎉 Tests terminés!"
```

### test-websocket.js
```javascript
// Test WebSocket avec Socket.IO
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: {
    token: 'test-token'
  }
});

socket.on('connect', () => {
  console.log('✅ WebSocket connecté');
  
  // Test des événements
  socket.emit('join_room', 'test-room');
  
  setTimeout(() => {
    socket.emit('send_notification', {
      title: 'Test',
      message: 'Notification de test'
    });
  }, 1000);
});

socket.on('notification', (data) => {
  console.log('📢 Notification reçue:', data);
});

socket.on('disconnect', () => {
  console.log('❌ WebSocket déconnecté');
});

// Fermer après 5 secondes
setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 5000);
```

## 🐛 Configuration Debugger

### .vscode/launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/simple-server.js",
      "env": {
        "NODE_ENV": "development",
        "PORT": "3001"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Debug Full Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/server.js",
      "env": {
        "NODE_ENV": "development",
        "PORT": "3001"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/tests/test-api.js",
      "console": "integratedTerminal"
    }
  ]
}
```

### .vscode/tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend Server",
      "type": "shell",
      "command": "node",
      "args": ["simple-server.js"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Test API Endpoints",
      "type": "shell",
      "command": "bash",
      "args": ["test-api.sh"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Install Dependencies",
      "type": "shell",
      "command": "npm",
      "args": ["install"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build"
    }
  ]
}
```

## 🔌 Extensions Recommandées

### Extensions Essentielles
```json
{
  "recommendations": [
    "humao.rest-client",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-node-debug2"
  ]
}
```

### Configuration des Extensions

#### REST Client
```json
{
  "rest-client.environmentVariables": {
    "local": {
      "baseUrl": "http://localhost:3001",
      "apiUrl": "http://localhost:3001/api",
      "token": "your-jwt-token"
    }
  }
}
```

#### Prettier
```json
{
  "prettier.semi": true,
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.tabWidth": 2
}
```

## 📝 Snippets de Code

### .vscode/snippets.json
```json
{
  "API Route": {
    "prefix": "api-route",
    "body": [
      "app.${1|get,post,put,patch,delete|}('${2:/api/endpoint}', ${3:middleware}, (req, res) => {",
      "  try {",
      "    // ${4:Route logic}",
      "    res.json({",
      "      success: true,",
      "      data: ${5:result}",
      "      message: '${6:Success message}'",
      "    });",
      "  } catch (error) {",
      "    console.error('Error:', error);",
      "    res.status(500).json({",
      "      success: false,",
      "      message: 'Internal server error'",
      "    });",
      "  }",
      "});"
    ],
    "description": "Create API route"
  },
  "Middleware": {
    "prefix": "middleware",
    "body": [
      "const ${1:middlewareName} = (req, res, next) => {",
      "  try {",
      "    // ${2:Middleware logic}",
      "    next();",
      "  } catch (error) {",
      "    res.status(400).json({",
      "      success: false,",
      "      message: error.message",
      "    });",
      "  }",
      "};"
    ],
    "description": "Create middleware function"
  },
  "Error Handler": {
    "prefix": "error-handler",
    "body": [
      "app.use((err, req, res, next) => {",
      "  console.error('Error:', err);",
      "  res.status(${1:500}).json({",
      "    success: false,",
      "    message: '${2:Error message}',",
      "    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'",
      "  });",
      "});"
    ],
    "description": "Error handling middleware"
  }
}
```

## 🎯 Tasks VSCode

### Commandes Disponibles
- `Ctrl+Shift+P` → "Tasks: Run Task"
- `Ctrl+Shift+P` → "Tasks: Run Build Task"

### Raccourcis Clavier
```json
{
  "key": "ctrl+shift+b",
  "command": "workbench.action.tasks.build"
},
{
  "key": "ctrl+shift+t",
  "command": "workbench.action.tasks.test"
}
```

## 🔍 Debugging Avancé

### Breakpoints Conditionnels
```javascript
// Dans votre code
if (req.user.role === 'ADMIN') {
  debugger; // Breakpoint conditionnel
}
```

### Variables de Debug
```javascript
// Ajouter à votre code pour le debugging
console.log('Debug - User:', req.user);
console.log('Debug - Body:', req.body);
console.log('Debug - Headers:', req.headers);
```

### Profiling
```javascript
// Mesurer les performances
const start = Date.now();
// ... votre code ...
console.log(`Execution time: ${Date.now() - start}ms`);
```

## 📊 Monitoring en Temps Réel

### Logs en Direct
```bash
# Terminal 1: Serveur
npm run backend:start

# Terminal 2: Logs
tail -f logs/sogara.log

# Terminal 3: Monitoring
watch -n 1 'curl -s http://localhost:3001/health | jq'
```

### Métriques de Performance
```javascript
// Ajouter à votre serveur
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

## 🚀 Workflow de Développement

### 1. Démarrage
```bash
# Terminal 1: Backend
npm run backend:start

# Terminal 2: Frontend
npm run dev

# Terminal 3: Convex
npm run dev:convex
```

### 2. Test
```bash
# Tests API
bash test-api.sh

# Tests WebSocket
node test-websocket.js
```

### 3. Debug
- F9: Toggle breakpoint
- F5: Start debugging
- F10: Step over
- F11: Step into
- Shift+F11: Step out

## 📚 Ressources

- [Documentation REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Documentation Node.js Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Documentation Tasks](https://code.visualstudio.com/docs/editor/tasks)

---

**Note**: Cette configuration optimise le développement avec Cursor pour le backend SOGARA.