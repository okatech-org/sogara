#!/bin/bash

# Configuration des variables d'environnement
export JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
export JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-here-change-in-production"
export PORT=3001
export NODE_ENV=development
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=sogara_db
export DB_USER=postgres
export DB_PASSWORD=password
export CORS_ORIGIN=http://localhost:8080

# Démarrage du serveur
cd backend && node src/server.js
