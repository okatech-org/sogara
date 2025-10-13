# 🔗 URLs Spécifiques par Compte

## 📋 Table de Routage Personnalisée

Chaque compte SOGARA Access possède maintenant sa propre URL de destination et son dashboard adapté à son rôle.

---

## 🎯 Mapping Comptes → URLs

| Matricule  | Nom                 | Rôle                      | URL Spécifique   | Dashboard                     |
| ---------- | ------------------- | ------------------------- | ---------------- | ----------------------------- |
| **ADM001** | PELLEN Asted        | ADMIN                     | `/app/admin`     | Dashboard Administrateur      |
| **DG001**  | Daniel MVOU         | DG, ADMIN                 | `/app/direction` | Dashboard Direction Générale  |
| **DRH001** | Brigitte NGUEMA     | DRH, ADMIN                | `/app/rh`        | Dashboard Ressources Humaines |
| **COM001** | Clarisse MBOUMBA    | COMMUNICATION             | `/app/connect`   | SOGARA Connect                |
| **HSE001** | Marie-Claire NZIEGE | HSE, COMPLIANCE, SECURITE | `/app/hse`       | Dashboard HSE Complet         |
| **REC001** | Sylvie KOUMBA       | RECEP                     | `/app/visites`   | Gestion Visites & Colis       |
| **EMP001** | Pierre BEKALE       | EMPLOYE                   | `/app/dashboard` | Dashboard Employé             |

---

## 📄 Détails par Compte

### 1. ADM001 - PELLEN Asted 🔧

**URL**: `https://sogara.lovable.app/app/admin`

#### Dashboard Administrateur

- **Modules accessibles** :
  - Personnel (gestion complète)
  - HSE & Sécurité (supervision)
  - Équipements (gestion EPI)
  - Visites (contrôle accès)
  - SOGARA Connect (modération)
  - Projet & Documentation

- **KPIs affichés** :
  - Nombre d'employés
  - Visites aujourd'hui
  - Taux conformité HSE
  - Disponibilité système

- **Actions rapides** :
  - Gérer les utilisateurs
  - Supervision HSE
  - Documentation système

- **Permissions** : Accès complet (ADMIN)

---

### 2. DG001 - Daniel MVOU 👑

**URL**: `https://sogara.lovable.app/app/direction`

#### Dashboard Direction Générale

- **Vue stratégique** :
  - Performance opérationnelle (95%)
  - Effectif total
  - Conformité HSE
  - Objectifs stratégiques (8/10)

- **Pilotage par domaine** :
  - Ressources Humaines (effectif, formations)
  - HSE & Conformité (taux, incidents)
  - Opérations & Production (équipements, maintenance)
  - Communication Interne (publications, engagement)

- **Indicateurs clés** :
  - Taux conformité HSE (barre de progression)
  - Équipements opérationnels (95%)
  - Satisfaction interne (88%)

- **Priorités de la semaine** :
  - Audit HSE trimestriel
  - Comité de direction
  - Présentation résultats Q1

- **Permissions** : Accès complet (DG + ADMIN)

---

### 3. DRH001 - Brigitte NGUEMA 👥

**URL**: `https://sogara.lovable.app/app/rh`

#### Dashboard Ressources Humaines

- **KPIs RH** :
  - Effectif total ({count} collaborateurs)
  - Formations HSE cette semaine
  - Taux conformité formations
  - Satisfaction (87% enquête annuelle)

- **Modules RH** :
  - Gestion du Personnel (base de données)
  - Formations & Compétences (suivi habilitations)
  - Sécurité & Conformité (HSE réglementaire)

- **Répartition par service** :
  - Production : X employés
  - HSE et Conformité : X employés
  - Communication : X employé
  - Sécurité : X employé
  - Direction Générale : X employé
  - Ressources Humaines : X employé
  - ORGANEUS Gabon : X employé

- **Actions RH prioritaires** :
  - Gérer les employés
  - Suivi formations HSE
  - Conformité et habilitations
  - Communication RH

- **Permissions** : Personnel, Formations, HSE (DRH + ADMIN)

---

### 4. COM001 - Clarisse MBOUMBA 📢

**URL**: `https://sogara.lovable.app/app/connect`

#### SOGARA Connect (Communication)

- **Page dédiée** : Publication et gestion de contenu
- **Fonctionnalités** :
  - Créer/éditer des publications
  - Gérer actualités, annonces, événements
  - Statistiques engagement (vues, likes, commentaires)
  - Catégorisation et tags

- **Statistiques** :
  - Total publications
  - Publications cette semaine
  - Répartition par catégorie

- **Permissions** : SOGARA Connect (édition complète)

---

### 5. HSE001 - Marie-Claire NZIEGE 🛡️

**URL**: `https://sogara.lovable.app/app/hse`

#### Dashboard HSE Complet (9 onglets)

- **Modules spécialisés** :
  1. Vue d'ensemble (KPIs)
  2. Incidents (gestion et enquêtes)
  3. Formations & Modules (catalogue 9 formations)
  4. Collaborateurs (suivi personnalisé)
  5. Notifications (communication ciblée)
  6. Attribution Auto (règles automatiques)
  7. Conformité & EPI (équipements)
  8. Système & Outils (admin)
  9. Analyses & Rapports (graphiques)

- **Fonctionnalités avancées** :
  - Attribution automatique formations
  - Centre de notifications HSE
  - Suivi conformité par employé
  - Gestion incidents critiques (H2S, etc.)

- **Permissions** : HSE, COMPLIANCE, SECURITE

---

### 6. REC001 - Sylvie KOUMBA 📦

**URL**: `https://sogara.lovable.app/app/visites`

#### Gestion Visites & Colis

- **Page dédiée** : Réception et contrôle accès
- **Fonctionnalités** :
  - Enregistrement visiteurs
  - Check-in / Check-out
  - Gestion badges
  - Réception colis et courriers
  - Distribution destinataires

- **Statistiques** :
  - Visites aujourd'hui
  - Colis en attente
  - Badges actifs

- **Permissions** : Visites, Colis & Courriers (RECEP)

---

### 7. EMP001 - Pierre BEKALE ⚙️

**URL**: `https://sogara.lovable.app/app/dashboard`

#### Dashboard Employé Standard

- **Vue personnelle** :
  - Informations de service
  - Indicateurs personnels
  - Formations planifiées
  - Équipements affectés

- **Accès lecture** :
  - SOGARA Connect (actualités)
  - Notifications personnelles

- **Permissions** : Dashboard, SOGARA Connect (lecture seule)

---

## 🔄 Logique de Redirection

### Après Login

```typescript
// Dans LoginForm.tsx
const account = demoAccounts.find(acc => acc.id === accountId)
if (account?.defaultRoute) {
  window.location.href = account.defaultRoute
}
```

### Comportement

1. **Login avec matricule** → Authentification
2. **Récupération du defaultRoute** dans demoAccounts
3. **Redirection automatique** vers l'URL spécifique
4. **Affichage du dashboard** adapté au rôle

### Exemples

```
Login ADM001 → Redirect to /app/admin
Login DG001  → Redirect to /app/direction
Login DRH001 → Redirect to /app/rh
Login COM001 → Redirect to /app/connect
Login HSE001 → Redirect to /app/hse
Login REC001 → Redirect to /app/visites
Login EMP001 → Redirect to /app/dashboard
```

---

## 🛡️ Protection des Routes

### Routes Protégées dans App.tsx

```typescript
// Dashboard Administrateur (ADMIN uniquement)
<Route path="admin" element={
  <RoleProtected roles={['ADMIN']}>
    <AdminDashboard />
  </RoleProtected>
} />

// Dashboard Direction (DG ou ADMIN)
<Route path="direction" element={
  <RoleProtected roles={['DG', 'ADMIN']}>
    <DirectionDashboard />
  </RoleProtected>
} />

// Dashboard RH (DRH ou ADMIN)
<Route path="rh" element={
  <RoleProtected roles={['DRH', 'ADMIN']}>
    <RHDashboard />
  </RoleProtected>
} />

// HSE (HSE ou ADMIN)
<Route path="hse" element={
  <RoleProtected roles={['ADMIN', 'HSE']}>
    <HSEPage />
  </RoleProtected>
} />

// Visites (RECEP, SUPERVISEUR ou ADMIN)
<Route path="visites" element={
  <RoleProtected roles={['ADMIN', 'RECEP', 'SUPERVISEUR']}>
    <VisitesPage />
  </RoleProtected>
} />
```

### Contrôle d'Accès

- ✅ Utilisateur sans le rôle requis → Redirect to `/app/dashboard`
- ✅ Utilisateur non authentifié → Redirect to `/login`

---

## 🎨 Différenciation Visuelle

### Couleurs par Compte

```
ADM001 → bg-destructive (rouge/admin)
DG001  → bg-primary (bleu/direction)
DRH001 → bg-secondary (gris/RH)
COM001 → bg-accent (violet/communication)
HSE001 → bg-secondary (orange/HSE)
REC001 → bg-accent (vert/réception)
EMP001 → bg-secondary (gris/employé)
```

### Icônes par Rôle

```
ADM001 → Settings ⚙️
DG001  → Crown 👑
DRH001 → UserCog 👥
COM001 → Megaphone 📢
HSE001 → Shield 🛡️
REC001 → Package 📦
EMP001 → HardHat ⚒️
```

---

## 📊 Contenu Spécifique par Dashboard

### AdminDashboard (ADM001)

- **Focus** : Supervision technique et système
- **Modules** : Tous (6 cards cliquables)
- **Actions** : Gestion utilisateurs, HSE, Documentation

### DirectionDashboard (DG001)

- **Focus** : Vision stratégique et performance
- **KPIs** : Performance opérationnelle, objectifs, conformité
- **Pilotage** : Par domaine (RH, HSE, Ops, Communication)
- **Priorités** : Agenda direction (audits, comités, présentations)

### RHDashboard (DRH001)

- **Focus** : Capital humain et formations
- **KPIs** : Effectif, formations, conformité, satisfaction
- **Modules** : Personnel, Formations, Conformité
- **Répartition** : Par service (détail effectifs)

### HSEDashboard (HSE001)

- **Focus** : Sécurité, formations, conformité
- **Modules** : 9 onglets spécialisés
- **Fonctionnalités** : Gestion collaborateurs, notifications, attribution auto

### SOGARA Connect (COM001)

- **Focus** : Communication et contenu
- **Fonctionnalités** : Publication, édition, engagement

### Visites (REC001)

- **Focus** : Accueil et sécurité
- **Fonctionnalités** : Visiteurs, badges, colis

### Dashboard Employé (EMP001)

- **Focus** : Vue personnelle
- **Accès** : Lecture informations et actualités

---

## ✅ Tests de Validation

### Test 1: Redirection ADM001

```
1. Login avec ADM001
2. Vérifier redirect → /app/admin
3. Vérifier dashboard "Administrateur" affiché
4. Vérifier 6 modules accessibles
```

### Test 2: Redirection DG001

```
1. Login avec DG001
2. Vérifier redirect → /app/direction
3. Vérifier dashboard "Direction Générale" affiché
4. Vérifier 4 domaines stratégiques
```

### Test 3: Redirection DRH001

```
1. Login avec DRH001
2. Vérifier redirect → /app/rh
3. Vérifier dashboard "Ressources Humaines" affiché
4. Vérifier répartition par service
```

### Test 4: URLs Existantes

```
COM001 → /app/connect ✅ (déjà fonctionnel)
HSE001 → /app/hse ✅ (déjà fonctionnel)
REC001 → /app/visites ✅ (déjà fonctionnel)
EMP001 → /app/dashboard ✅ (existant)
```

### Test 5: Protection Routes

```
Employé (EMP001) tente /app/admin → Redirect /app/dashboard ✅
Réceptionniste (REC001) tente /app/direction → Redirect /app/dashboard ✅
```

---

## 🔧 Fichiers Modifiés

### 1. Routes et Dashboards

- ✅ `src/pages/AdminDashboard.tsx` (CRÉÉ)
- ✅ `src/pages/DirectionDashboard.tsx` (CRÉÉ)
- ✅ `src/pages/RHDashboard.tsx` (CRÉÉ)
- ✅ `src/App.tsx` (3 routes ajoutées)

### 2. Configuration Comptes

- ✅ `src/data/demoAccounts.ts` (defaultRoute mis à jour)
  - ADM001: `/app/dashboard` → `/app/admin`
  - DG001: `/app/dashboard` → `/app/direction`
  - DRH001: `/app/dashboard` → `/app/rh`

### 3. Authentification

- ✅ `src/components/auth/LoginForm.tsx` (redirection auto ajoutée)

---

## 📱 Navigation Interne

### Depuis n'importe quel dashboard

Les utilisateurs peuvent naviguer vers les modules autorisés via:

1. **Navigation latérale** (sidebar)
2. **Cards cliquables** dans leur dashboard
3. **Actions rapides** (header dropdown)
4. **URL directe** (si permissions suffisantes)

### Exemple: DG001 (Direction Générale)

```
Dashboard Direction (/app/direction)
  ↓ (clic card "Ressources Humaines")
Module RH (/app/rh) → Accessible car DG a rôle ADMIN
  ↓ (clic "Gérer employés")
Personnel (/app/personnel) → Accessible
```

---

## 🎯 Avantages de l'Architecture

### 1. **Expérience Personnalisée**

- Chaque rôle voit d'abord ce qui le concerne
- Dashboards optimisés pour les besoins métier
- Navigation intuitive vers fonctions principales

### 2. **Sécurité Renforcée**

- Routes protégées par rôle (RoleProtected)
- Redirection automatique si accès non autorisé
- Séparation claire des niveaux d'accès

### 3. **Maintenance Facilitée**

- defaultRoute centralisé dans demoAccounts
- Ajout/modification de comptes simplifié
- Protection automatique via tableau de routes

### 4. **Scalabilité**

- Nouveaux rôles faciles à ajouter
- Dashboards modulaires et réutilisables
- Pattern clair pour nouvelles pages

---

## 🔗 URLs Publiques (après déploiement)

```
# Administrateur
https://sogara.lovable.app/app/admin

# Direction Générale
https://sogara.lovable.app/app/direction

# Ressources Humaines
https://sogara.lovable.app/app/rh

# Communication
https://sogara.lovable.app/app/connect

# HSE & Conformité
https://sogara.lovable.app/app/hse

# Réception & Sécurité
https://sogara.lovable.app/app/visites

# Employé Standard
https://sogara.lovable.app/app/dashboard
```

---

## ✅ Statut d'Implémentation

| Compte | URL              | Dashboard          | Route Protégée | Redirect Auto | Status          |
| ------ | ---------------- | ------------------ | -------------- | ------------- | --------------- |
| ADM001 | `/app/admin`     | AdminDashboard     | ✅ ADMIN       | ✅            | ✅ Opérationnel |
| DG001  | `/app/direction` | DirectionDashboard | ✅ DG, ADMIN   | ✅            | ✅ Opérationnel |
| DRH001 | `/app/rh`        | RHDashboard        | ✅ DRH, ADMIN  | ✅            | ✅ Opérationnel |
| COM001 | `/app/connect`   | SOGARAConnectPage  | ✅ Tous        | ✅            | ✅ Opérationnel |
| HSE001 | `/app/hse`       | HSEPage            | ✅ HSE, ADMIN  | ✅            | ✅ Opérationnel |
| REC001 | `/app/visites`   | VisitesPage        | ✅ RECEP       | ✅            | ✅ Opérationnel |
| EMP001 | `/app/dashboard` | Dashboard          | ✅ Tous        | ✅            | ✅ Opérationnel |

---

**Version**: 1.0  
**Date**: 2025-01-09  
**Statut**: ✅ Système de Routage Personnalisé Opérationnel  
**Impact**: Chaque compte a maintenant son espace dédié avec URL unique
