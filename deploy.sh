#!/bin/bash

echo "🚀 Déploiement SOGARA Access sur Lovable"
echo "========================================"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

# Construire le projet
echo "🔨 Construction du build de production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction"
    exit 1
fi

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: dossier dist non créé"
    exit 1
fi

echo "✅ Build réussi!"
echo "📁 Fichiers générés dans: ./dist/"
echo ""

# Afficher les informations de déploiement
echo "📋 Informations de déploiement:"
echo "- Taille du build: $(du -sh dist | cut -f1)"
echo "- Fichiers générés: $(find dist -type f | wc -l)"
echo "- Site: https://sogara.lovable.app/"
echo ""

# Instructions finales
echo "🎯 Prochaines étapes:"
echo "1. Le build est prêt dans ./dist/"
echo "2. Lovable va automatiquement déployer depuis GitHub"
echo "3. Vérifiez https://sogara.lovable.app/ dans quelques minutes"
echo ""

# Afficher les comptes de test
echo "👤 Comptes de test disponibles:"
echo "┌─────────┬───────────────────────┬─────────────────┐"
echo "│ Matricule│ Nom                   │ Rôle            │"
echo "├─────────┼───────────────────────┼─────────────────┤"
echo "│ ADM001  │ PELLEN Asted          │ Administrateur  │"
echo "│ HSE001  │ Marie-Claire NZIEGE   │ Responsable HSE │"
echo "│ REC001  │ Sylvie KOUMBA         │ Sécurité        │"
echo "│ COM001  │ Clarisse MBOUMBA      │ Communication   │"
echo "│ EMP001  │ Pierre BEKALE         │ Employé         │"
echo "│ DG001   │ Daniel MVOU           │ Directeur Gén.  │"
echo "│ DRH001  │ Brigitte NGUEMA       │ DRH             │"
echo "└─────────┴───────────────────────┴─────────────────┘"
echo ""

echo "🎉 Déploiement préparé avec succès!"
