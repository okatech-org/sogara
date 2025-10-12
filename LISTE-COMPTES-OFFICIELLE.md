# 👥 Liste Officielle des Comptes SOGARA Access

## 📊 Vue d'Ensemble

**Total**: 7 comptes actifs  
**Dernière mise à jour**: 2025-01-09  
**Statut**: ✅ Cohérent et vérifié

---

## 🏢 Structure Organisationnelle

### 🔴 Direction et Administration (3 comptes avec ADMIN)

#### 1. PELLEN Asted - ADM001
```yaml
Matricule:    ADM001
Nom complet:  PELLEN Asted
Poste:        Administrateur Systèmes & Informatique
Organisation: ORGANEUS Gabon (partenaire externe)
Rôles:        ADMIN
Email:        pellen.asted@organeus.ga
Mot de passe: Admin123!
Route:        /app/dashboard

Responsabilités:
  - Supervision générale des modules
  - Gestion des utilisateurs et permissions
  - Configuration et paramètres avancés
  - Validation des processus critiques
  - Analyse des rapports stratégiques
  - Pilotage de la documentation technique

Accès: COMPLET - Tous les modules
```

#### 2. Daniel MVOU - DG001
```yaml
Matricule:    DG001
Nom complet:  Daniel MVOU
Poste:        Directeur Général
Service:      Direction Générale
Rôles:        DG, ADMIN
Email:        daniel.mvou@sogara.com
Mot de passe: DG123!
Route:        /app/dashboard

Responsabilités:
  - Direction générale de l'entreprise
  - Pilotage stratégique global
  - Supervision de tous les départements
  - Validation des décisions critiques
  - Relations institutionnelles
  - Vision et orientation stratégique

Accès: COMPLET - Tous modules + Tableaux de bord stratégiques
```

#### 3. Brigitte NGUEMA - DRH001
```yaml
Matricule:    DRH001
Nom complet:  Brigitte NGUEMA
Poste:        Directrice des Ressources Humaines
Service:      Ressources Humaines
Rôles:        DRH, ADMIN
Email:        brigitte.nguema@sogara.com
Mot de passe: DRH123!
Route:        /app/dashboard

Responsabilités:
  - Direction des ressources humaines
  - Gestion du personnel et des carrières
  - Pilotage des formations et développement
  - Gestion des compétences et habilitations
  - Supervision du recrutement
  - Relations sociales

Accès: Personnel, Formations, HSE, Tableaux de bord RH
```

---

### 🟠 Services Opérationnels (4 comptes)

#### 4. Marie-Claire NZIEGE - HSE001 🛡️
```yaml
Matricule:    HSE001
Nom complet:  Marie-Claire NZIEGE
Poste:        Chef de Division HSE et Conformité
Service:      HSE et Conformité
Rôles:        HSE, COMPLIANCE, SECURITE
Email:        marie-claire.nziege@sogara.com
Mot de passe: HSE123!
Route:        /app/hse

Responsabilités:
  - Direction de la division HSE et Conformité
  - Gestion des incidents de sécurité
  - Supervision de la conformité réglementaire
  - Organisation des formations HSE
  - Suivi des habilitations et certifications
  - Inspection des équipements de sécurité
  - Production des rapports sécurité et conformité

Accès: Personnel, Équipements, HSE, Conformité, Sécurité, Réception

Modules HSE:
  ✅ Gestion Collaborateurs (suivi formations)
  ✅ Centre de Notifications (communication)
  ✅ Attribution Automatique (règles)
  ✅ Catalogue 9 formations
  ✅ Incidents et enquêtes
  ✅ Conformité et EPI
  ✅ Analyses et rapports
```

#### 5. Clarisse MBOUMBA - COM001 📢
```yaml
Matricule:    COM001
Nom complet:  Clarisse MBOUMBA
Poste:        Directeur Communication
Service:      Communication
Rôles:        COMMUNICATION
Email:        clarisse.mboumba@sogara.com
Mot de passe: Communication123!
Route:        /app/connect

Responsabilités:
  - Direction de la communication
  - Gestion complète de SOGARA Connect
  - Création de contenu SOGARA Connect
  - Publication des actualités internes
  - Organisation des événements internes
  - Animation de la vie sociale

Accès: SOGARA Connect (édition complète)

Note: ✅ UNIQUE - Seul compte COMMUNICATION
      ❌ COM002 (Aminata SECK) SUPPRIMÉ
```

#### 6. Sylvie KOUMBA - REC001 📦
```yaml
Matricule:    REC001
Nom complet:  Sylvie KOUMBA
Poste:        Responsable Sécurité
Service:      Sécurité
Rôles:        RECEP
Email:        sylvie.koumba@sogara.com
Mot de passe: Reception123!
Route:        /app/visites

Responsabilités:
  - Gestion de la sécurité du site
  - Enregistrement des visiteurs
  - Gestion des badges et check-in/out
  - Réception des colis et courriers
  - Distribution aux destinataires

Accès: Visites, Colis & Courriers
```

#### 7. Pierre BEKALE - EMP001 ⚙️
```yaml
Matricule:    EMP001
Nom complet:  Pierre BEKALE
Poste:        Technicien Raffinage
Service:      Production
Rôles:        EMPLOYE
Email:        pierre.bekale@sogara.com
Mot de passe: Employee123!
Route:        /app/dashboard

Responsabilités:
  - Consultation des informations de service
  - Suivi des indicateurs personnels
  - Lecture des actualités internes
  - Suivi des formations planifiées
  - Visualisation des équipements affectés

Accès: Dashboard, SOGARA Connect (lecture)
```

---

## 🔐 Matrice des Permissions

| Compte | Personnel | Visites | Colis | Équipements | HSE | Connect | Dashboard |
|--------|-----------|---------|-------|-------------|-----|---------|-----------|
| **ADM001** | ✅ RW | ✅ RW | ✅ RW | ✅ RW | ✅ RW | ✅ RW | ✅ RW |
| **DG001** | ✅ RW | ✅ RW | ✅ RW | ✅ RW | ✅ RW | ✅ RW | ✅ RW |
| **DRH001** | ✅ RW | ✅ R | ✅ R | ✅ R | ✅ RW | ✅ R | ✅ RW |
| **HSE001** | ✅ RW | ✅ R | ✅ R | ✅ RW | ✅ RW | ✅ R | ✅ R |
| **COM001** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ RW | ✅ R |
| **REC001** | ❌ | ✅ RW | ✅ RW | ❌ | ❌ | ✅ R | ✅ R |
| **EMP001** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ R | ✅ R |

**Légende**: R = Lecture, W = Écriture, RW = Lecture + Écriture

---

## 🎯 Routes par Défaut

```
ADM001  → /app/dashboard (admin)
DG001   → /app/dashboard (direction)
DRH001  → /app/dashboard (RH)
HSE001  → /app/hse (module HSE complet)
COM001  → /app/connect (SOGARA Connect)
REC001  → /app/visites (réception)
EMP001  → /app/dashboard (employé)
```

---

## 🧪 Tests de Connexion

### Connexion COM001 (Clarisse MBOUMBA)
```typescript
Login: COM001
Password: Communication123!
Expected Name: "Clarisse MBOUMBA" ✅
Expected Route: /app/connect
Expected Role: COMMUNICATION
```

### Connexion HSE001 (Marie-Claire NZIEGE)
```typescript
Login: HSE001
Password: HSE123!
Expected Name: "Marie-Claire NZIEGE" ✅
Expected Route: /app/hse
Expected Roles: HSE, COMPLIANCE, SECURITE
```

### Vérification Absence Doublons
```typescript
// Ne devrait PAS exister
COM002 ❌ SUPPRIMÉ
SUP001 ❌ N'EXISTE PAS
Marie LAKIBI ❌ N'EXISTE PAS
Aminata SECK ❌ SUPPRIMÉE
```

---

## 📝 Changelog

### 2025-01-09 - Nettoyage Majeur
```diff
- Supprimé: COM002 (Aminata SECK) - doublon COMMUNICATION
- Supprimé: SUP001 (Christian ELLA) - n'existait que dans Convex
- Corrigé: Tous les vieux noms (Marie LAKIBI, etc.)
- Ajouté: DG001 et DRH001 dans convex/seed.ts
+ Résultat: 7 comptes cohérents et uniques
```

---

## ✅ Checklist de Validation

- [x] COM002 supprimé de demoAccounts.ts
- [x] COM002 supprimé de repositories.ts (2 occurrences)
- [x] Type DemoAccountSlug mis à jour
- [x] Tous "Marie LAKIBI" → "Marie-Claire NZIEGE"
- [x] Tous "Christian ELLA" → "Pierre BEKALE" ou supprimé
- [x] Tous "Pierre ANTCHOUET" → "Pierre BEKALE"
- [x] Tous "Alain OBAME" / "Jean-Claude OBAME" → "PELLEN Asted"
- [x] SUP001 supprimé de convex/seed.ts
- [x] DG001 et DRH001 ajoutés dans convex/seed.ts
- [x] Documentation mise à jour (deploy.sh, README)
- [x] Aucune erreur linter
- [x] Aucune occurrence des vieux noms dans src/
- [x] Aucune occurrence des vieux noms dans convex/
- [x] Aucune occurrence des vieux noms dans backend/

---

**Document généré automatiquement**  
**Référence**: Source de vérité pour les comptes SOGARA Access  
**Validité**: Permanente (sauf modifications futures)
