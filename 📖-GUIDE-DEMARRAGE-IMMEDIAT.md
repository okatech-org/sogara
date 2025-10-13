# 📖 GUIDE DE DÉMARRAGE IMMÉDIAT - SOGARA

## 🎯 Vous êtes à 5 minutes d'une application complète !

---

## ⚡ ACTION MAINTENANT (dans votre terminal)

### Étape 1 : Convex est déjà lancé ✅

Dans votre terminal, vous voyez :

```
? Welcome to Convex! Would you like to login to your account?
❯ Start without an account (run Convex locally)
  Login or create an account
```

**UTILISEZ LA FLÈCHE ↓ pour sélectionner :**

```
  Login or create an account
```

**APPUYEZ SUR ENTRÉE**

---

## 🔐 Authentification Convex

### Option 1 : GitHub (Recommandé) ⭐

1. Convex va ouvrir votre navigateur
2. Cliquez "Continue with GitHub"
3. Autorisez Convex
4. Retournez au terminal

### Option 2 : Google

1. Cliquez "Continue with Google"
2. Choisissez votre compte
3. Autorisez Convex

### Option 3 : Email

1. Entrez votre email
2. Vérifiez votre boîte mail
3. Cliquez sur le lien

---

## 📝 Création du Projet

### Le terminal vous demande :

```
? What would you like to call your Convex project?
```

**TAPEZ :** `sogara`

**APPUYEZ SUR ENTRÉE**

---

## ⏳ Génération Automatique (30 sec)

Convex va automatiquement :

1. Créer votre projet sur le cloud
2. Générer le dossier `convex/_generated/`
3. Créer les types TypeScript
4. Mettre à jour `.env`
5. Afficher une URL

**ATTENDEZ de voir :**

```
✓ Convex functions ready!
✓ Deployment URL: https://XXX.convex.cloud
✓ Dashboard: https://dashboard.convex.dev/...

[Convex watching for changes...]
```

---

## ✅ Validation Étape 1

### Dans le terminal, vous devez voir :

- ✓ Convex functions ready!
- ✓ Deployment URL (une URL https://)
- [Convex watching for changes...]

### Vérifier fichiers créés :

```bash
# Dans un AUTRE terminal (garder convex dev actif)
ls -la convex/_generated/

# Vous devez voir :
# api.d.ts
# api.js
# dataModel.d.ts
# server.d.ts
# server.js
```

**SI VOUS VOYEZ CES FICHIERS : ✅ SUCCÈS !**

---

## 🌱 Étape 2 : Charger les Données (30 sec)

### Dans un NOUVEAU terminal :

```bash
cd /Users/okatech/SOGARA/sogara
npx convex run seed:seedDemoData
```

### Résultat attendu :

```
🌱 Début du seeding...
👤 Création des employés...
✅ 6 employés créés
👥 Création des visiteurs...
✅ 3 visiteurs créés
📅 Création des visites...
✅ 3 visites créées
📦 Création des colis/courriers...
✅ 3 colis/courriers créés
🔧 Création des équipements...
✅ 3 équipements créés
⚠️ Création des incidents HSE...
✅ 2 incidents HSE créés
🎓 Création des formations HSE...
✅ 15 formations HSE créées
📰 Création des posts...
✅ 3 posts créés
🎉 Seeding terminé avec succès !
📊 Résumé:
  - 6 employés
  - 3 visiteurs
  - 3 visites
  - 3 colis/courriers
  - 3 équipements
  - 2 incidents HSE
  - 15 formations HSE
  - 3 posts SOGARA Connect
```

**SI VOUS VOYEZ CE MESSAGE : ✅ SUCCÈS !**

---

## 🖥️ Étape 3 : Dashboard Convex (1 min)

### Ouvrir le dashboard :

```bash
npx convex dashboard
```

**OU** ouvrir l'URL affichée dans le terminal de convex dev

### Vérifier les données :

Cliquez sur chaque table dans le menu gauche :

- `employees` → **6 entrées** ✅
- `visitors` → **3 entrées** ✅
- `visits` → **3 entrées** ✅
- `packages` → **3 entrées** ✅
- `equipment` → **3 entrées** ✅
- `hseIncidents` → **2 entrées** ✅
- `hseTrainings` → **15 entrées** ✅
- `posts` → **3 entrées** ✅

**SI TOUTES LES TABLES ONT DES DONNÉES : ✅ SUCCÈS !**

---

## 🚀 Étape 4 : Lancer l'Application (30 sec)

### Dans un 3ème terminal :

```bash
cd /Users/okatech/SOGARA/sogara
npm run dev
```

### Résultat attendu :

```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Ouvrir dans votre navigateur :** http://localhost:5173

---

## 🎮 Étape 5 : Tester (2 min)

### Test de connexion :

1. **Page de login** s'affiche
2. **Entrez** : `ADM001`
3. **Cliquez** : "Se connecter"
4. **Dashboard** s'affiche

### Test des données :

1. **Cliquez** : "Personnel" dans le menu
2. **Vous voyez** : 6 employés affichés
   - Pellen ASTED (ADM001)
   - Marie-Claire NZIEGE (HSE001)
   - Sylvie KOUMBA (REC001)
   - Clarisse MBOUMBA (COM001)
   - Pierre BEKALE (EMP001)
   - Christian ELLA (SUP001)

### Test temps réel :

1. **Ouvrez 2 onglets** de http://localhost:5173
2. **Connectez-vous** dans les 2 onglets (ADM001)
3. **Allez** sur "Personnel" dans les 2
4. **Dans l'onglet 1** : Créez un employé
5. **Dans l'onglet 2** : L'employé apparaît instantanément ⚡

**SI TOUT FONCTIONNE : ✅ FÉLICITATIONS !**

---

## 🎯 NAVIGATION RAPIDE

### Comptes à Tester

| Matricule  | Nom                 | Module Principal |
| ---------- | ------------------- | ---------------- |
| **ADM001** | Pellen ASTED        | Tous les modules |
| **HSE001** | Marie-Claire NZIEGE | Module HSE       |
| **REC001** | Sylvie KOUMBA       | Visites + Colis  |
| **COM001** | Clarisse MBOUMBA    | SOGARA Connect   |

### Fonctionnalités à Tester

#### Personnel (ADM001)

- Créer un employé
- Modifier un employé
- Rechercher par matricule
- Filtrer par service

#### Visites (REC001)

- Planifier une visite
- Check-in visiteur
- Check-out visiteur
- Voir les stats

#### Colis (REC001)

- Enregistrer un colis
- Marquer comme livré
- Voir les urgents

#### HSE (HSE001)

- Consulter les 15 formations
- Déclarer un incident
- Voir les stats

#### SOGARA Connect (COM001)

- Voir les 3 posts
- Créer un article
- Publier

---

## ⚠️ EN CAS DE PROBLÈME

### Erreur : "Cannot find module convex/\_generated/api"

**Solution :**

```bash
# Arrêter npm run dev
# Attendre que npx convex dev termine la génération
# Relancer npm run dev
```

### Erreur : "No data displayed"

**Solution :**

```bash
# Vérifier que le seed a été exécuté
npx convex run seed:seedDemoData

# Vérifier dans le dashboard
npx convex dashboard
```

### Erreur : "Login failed"

**Solution :**

- Utilisez EXACTEMENT le matricule (ex: ADM001)
- En MAJUSCULES
- Sans espaces

### Erreur : TypeScript

**Solution :**

```bash
# Supprimer .next et node_modules
rm -rf .next node_modules
npm install
npx convex dev
npm run dev
```

---

## 🎉 VOUS Y ÊTES PRESQUE !

**Dans 5 minutes, vous aurez :**

- ✅ Backend Convex fonctionnel
- ✅ Application full-stack complète
- ✅ Données persistantes
- ✅ Temps réel opérationnel
- ✅ Multi-utilisateurs
- ✅ Production-ready

**Il ne reste plus qu'à :**

1. Choisir "Login or create an account"
2. Se connecter
3. Créer le projet
4. Attendre la génération
5. Exécuter le seed
6. Lancer l'app
7. **TESTER !** 🎊

---

**ALLEZ-Y MAINTENANT ! VOUS ÊTES À 5 MINUTES DU SUCCÈS !** 🚀

---

_Guide créé le 9 Octobre 2025_
