# 🛡️ Guide de Test - Responsable HSE

## 👤 Compte de Test

### Identification
- **Matricule**: `HSE001`
- **Nom complet**: Marie-Claire NZIEGE
- **Poste**: Chef de Division HSE et Conformité
- **Email**: marie-claire.nziege@sogara.com
- **Mot de passe**: `HSE123!`
- **Rôles**: HSE, COMPLIANCE, SECURITE

### Route d'accès directe
```
/app/hse
```

## 🎯 Fonctionnalités à Tester

### 1. Dashboard HSE Principal ✅

**Accès**: `/app/hse`

#### Vue d'ensemble (Overview)
- [x] **KPIs en temps réel**
  - Incidents ouverts avec badge sévérité élevée
  - Formations cette semaine
  - Taux de conformité global
  - Actions requises (enquêtes en cours)

- [x] **Actions rapides** (HSEQuickActions)
  - Créer un incident (bouton rouge)
  - Programmer une formation
  - Voir la conformité
  - Exporter un rapport

- [x] **Incidents récents** (5 derniers)
  - Cartes cliquables avec détails
  - Badges de sévérité (Faible/Moyen/Élevé)
  - Badges de statut (Signalé/En cours/Résolu)
  - Date, lieu, déclarant visibles

- [x] **Formations à venir** (3 prochaines)
  - Date et heure de la session
  - Formateur assigné
  - Participants inscrits / Maximum
  - Barre de progression inscription

#### Onglet Incidents
- [x] **Recherche avancée** (HSEAdvancedSearch)
  - Par terme de recherche
  - Par sévérité (low/medium/high)
  - Par statut (reported/investigating/resolved)
  - Par type d'incident

- [x] **Liste filtrée des incidents**
  - Badge compteur si filtres actifs
  - Cartes détaillées cliquables
  - Description en aperçu (line-clamp-2)
  - Informations complètes (lieu, date, déclarant)

- [x] **Bouton "Déclarer un incident"**
  - Dialog modal HSEIncidentForm
  - Formulaire complet de déclaration
  - Upload de pièces jointes

- [x] **Incidents nécessitant attention**
  - Liste séparée des incidents ouverts
  - Fond jaune pour alerte visuelle
  - Clic pour voir détails

#### Onglet Formations & Modules ⭐
- [x] **Sous-onglet "Modules Interactifs"**
  - HSETrainerDashboard complet
  - Gestion des modules de formation
  - Contenu interactif

- [x] **Sous-onglet "Calendrier & Sessions"**
  - HSETrainingCalendar
  - Vue calendrier des sessions
  - Clic sur session pour détails

- [x] **Sous-onglet "Catalogue & Import"**
  - HSETrainingImporter (import JSON/Excel)
  - HSETrainingCatalog avec 9+ modules prédéfinis
  - Filtres par catégorie et rôle
  - Bouton "Programmer une session"

### 2. Gestion des Collaborateurs 🆕✅

**Accès**: Onglet "Collaborateurs" dans `/app/hse`

#### Tableau de bord global
- [x] **4 KPIs de conformité**
  - Total Employés (count)
  - Conformes ≥90% (vert)
  - À surveiller 70-89% (jaune)
  - Non conformes <70% (rouge)

- [x] **Filtres et recherche**
  - Recherche par nom, matricule, service
  - Filtre par service (dropdown)
  - Filtre par rôle (EMPLOYE, SUPERVISEUR, etc.)

#### Cartes employés
- [x] **Pour chaque employé**
  - Nom, matricule, service
  - Badges des rôles
  - **Taux de conformité** en gros (XX%)
  - Barre de progression formations
  - Ratio complétées/requises
  - Alertes visuelles (expirées, à renouveler)
  - Boutons "Détails" et "Assigner"

#### Vue détaillée employé
- [x] **En-tête**
  - Nom complet, matricule, service
  - Badges rôles
  - Status badge conformité

- [x] **4 statistiques détaillées**
  - Formations requises
  - Complétées (vert)
  - Expirées (rouge)
  - À renouveler (jaune)

- [x] **4 onglets de formations**
  - Requises: Liste + bouton "Programmer"
  - Complétées: Liste avec dates validité
  - Expirées: Liste + bouton "Rappel"
  - À renouveler: Liste + bouton "Renouveler"

### 3. Centre de Notifications 🆕✅

**Accès**: Onglet "Notifications" dans `/app/hse`

#### Vue globale
- [x] **Bouton "Envoyer une notification"** (HSE uniquement)
- [x] **4 KPIs notifications**
  - Total reçues
  - Non lues (jaune)
  - Urgentes (rouge)
  - Envoyées (bleu, HSE only)

#### Onglet "Notifications reçues"
- [x] **Filtres**
  - Par type (Formations/Incidents/Équipements/Conformité)
  - Par statut (Toutes/Non lues/Lues)

- [x] **Cartes notifications**
  - Icône selon type
  - Titre et type badge
  - Message complet
  - Date et heure
  - Bouton marquer comme lu
  - Badge "Non lu" si applicable
  - Expéditeur affiché

#### Onglet "Notifications envoyées" (HSE)
- [x] **Historique envois**
  - Liste complète avec destinataires
  - Statut de lecture (si trackable)

#### Dialog envoi notification
- [x] **Sélection modèle prédéfini**
  - 5 modèles disponibles:
    - Rappel de formation
    - Formation obligatoire
    - Alerte sécurité
    - Vérification équipement
    - Alerte conformité

- [x] **Formulaire personnalisé**
  - Titre (input)
  - Type (dropdown avec 6 options)
  - Message (textarea)
  - Sélection destinataires (checkboxes)
    - Liste scrollable de tous les employés
    - Compteur sélectionnés

- [x] **Pré-sélection intelligente**
  - Selon modèle choisi
  - Par rôle cible automatique

### 4. Attribution Automatique 🆕✅

**Accès**: Onglet "Attribution Auto" dans `/app/hse`

#### Vue principale
- [x] **Bouton "Lancer l'attribution"**
  - Animation pendant traitement
  - Toast de confirmation avec nombre

- [x] **4 KPIs système**
  - Règles actives / total
  - Auto-attribution (count)
  - Attributions totales générées
  - En attente de traitement (jaune)

#### Onglet "Règles d'attribution"
- [x] **6 règles par défaut**
  1. Induction obligatoire (tous nouveaux)
  2. Formation H2S (Production) - CRITIQUE
  3. Travail en hauteur (Maintenance)
  4. Espace confiné (Techniciens Production)
  5. Permis de travail (Superviseurs)
  6. SST (Personnel encadrement)

- [x] **Pour chaque règle**
  - Nom et description
  - Badge priorité (low/medium/high)
  - Badge "Auto" si auto-assign activé
  - Formation associée (titre + code)
  - Nombre d'employés concernés
  - Délai de rappel (jours)
  - **2 switches**:
    - Auto-assign ON/OFF
    - Règle Active ON/OFF
  - Bouton "Détails"

#### Onglet "Attributions générées"
- [x] **Table complète**
  - Colonnes: Employé, Formation, Règle, Priorité, Échéance, Statut
  - Tri et filtrage
  - Status badges (pending/notified/accepted/completed/rejected)

#### Onglet "Matrice de conformité"
- [x] **Vue par service**
  - Regroupement par service (Production, Maintenance, etc.)
  - Cartes formations requises
  - Nombre d'employés concernés
  - Badge priorité

### 5. Autres Onglets Existants

#### Conformité & EPI
- [x] **Sous-onglet "Tableau de Bord"**
  - HSEComplianceDashboard
  - Taux conformité global
  - Détails par service

- [x] **Sous-onglet "Gestion EPI"**
  - HSEEquipmentManagement
  - Liste équipements protection
  - Affectations et vérifications

- [x] **Sous-onglet "Audits & Contrôles"**
  - HSEAuditDashboard
  - Planning audits
  - Résultats et rapports

#### Système & Outils
- [x] **Sous-onglet "État Système"**
  - HSESystemStatus
  - Validation système HSE
  - Diagnostics

- [x] **Sous-onglet "Outils Import"**
  - HSEDataImportTools
  - Import données JSON/Excel
  - Bulk operations

- [x] **Sous-onglet "Maintenance"**
  - HSEMaintenanceTools
  - Nettoyage données
  - Optimisations

#### Analyses & Rapports
- [x] **HSEAnalyticsDashboard**
  - Graphiques incidents (tendances)
  - Graphiques formations (completion rate)
  - Graphiques conformité par service
  - Export PDF/Excel

## 🔄 Scénarios de Test Complets

### Scénario 1: Nouvel Employé en Production

**Objectif**: Vérifier l'attribution automatique des formations critiques

1. **Contexte**: Un nouveau technicien rejoint le service Production
   - Rôle: EMPLOYE
   - Service: Production

2. **Actions du Responsable HSE**:
   - ✅ Aller dans "Attribution Auto"
   - ✅ Vérifier que les règles Production sont actives:
     - Induction obligatoire (HIGH)
     - Formation H2S (HIGH) ⚠️ CRITIQUE
     - Espace confiné (HIGH)
   - ✅ Cliquer "Lancer l'attribution"
   - ✅ Vérifier dans "Attributions générées" que 3 formations sont attribuées
   - ✅ Aller dans "Collaborateurs"
   - ✅ Chercher l'employé
   - ✅ Vérifier son taux de conformité (devrait être bas)
   - ✅ Cliquer "Assigner" pour programmer les sessions
   - ✅ Envoyer notification "Formation obligatoire"

3. **Résultat attendu**:
   - 3 attributions automatiques créées
   - Notification envoyée à l'employé
   - Suivi visible dans le dashboard employé

### Scénario 2: Formation Expirée - Rappel

**Objectif**: Gérer une formation arrivant à expiration

1. **Détection**:
   - ✅ Dashboard HSE montre "Actions requises" > 0
   - ✅ Onglet "Collaborateurs" montre badge rouge pour employé

2. **Action**:
   - ✅ Cliquer sur l'employé concerné
   - ✅ Aller dans onglet "Expirées" ou "À renouveler"
   - ✅ Voir la liste des formations
   - ✅ Cliquer "Rappel" sur une formation

3. **Vérification notification**:
   - ✅ Aller dans "Notifications"
   - ✅ Vérifier notification envoyée (onglet "Envoyées")
   - ✅ Type = "hse_training_expiring"
   - ✅ Destinataire correct

### Scénario 3: Incident Critique H2S

**Objectif**: Déclarer et communiquer un incident critique

1. **Déclaration**:
   - ✅ Cliquer "Déclarer un incident" (bouton rouge)
   - ✅ Remplir formulaire:
     - Type: "Fuite H2S"
     - Sévérité: HIGH
     - Description détaillée
     - Lieu: "Zone Production - Unité 3"
     - Employé impliqué
   - ✅ Uploader photos/documents
   - ✅ Soumettre

2. **Communication**:
   - ✅ Aller dans "Notifications"
   - ✅ Sélectionner modèle "Alerte sécurité"
   - ✅ Personnaliser message avec détails H2S
   - ✅ Sélectionner tous employés Production
   - ✅ Envoyer

3. **Suivi**:
   - ✅ Retour dashboard HSE
   - ✅ Vérifier incident dans "Incidents récents"
   - ✅ Badge sévérité = rouge (Élevé)
   - ✅ Badge statut = orange (En cours)
   - ✅ KPI "Incidents ouverts" incrémenté

### Scénario 4: Planification Formation Collective

**Objectif**: Organiser session SST pour superviseurs

1. **Préparation**:
   - ✅ Onglet "Formations & Modules"
   - ✅ Sous-onglet "Catalogue & Import"
   - ✅ Chercher "SST" ou filtrer "Obligatoire"
   - ✅ Voir module HSE-008 (14h)

2. **Programmation**:
   - ✅ Cliquer "Programmer une session"
   - ✅ HSESessionScheduler s'ouvre
   - ✅ Définir:
     - Date et heure
     - Formateur (qualifié INRS)
     - Lieu (salle formation)
     - Max participants (10)

3. **Invitation**:
   - ✅ Aller dans "Attribution Auto"
   - ✅ Vérifier règle "SST (Encadrement)"
   - ✅ Voir liste employés concernés
   - ✅ Ou aller dans "Notifications"
   - ✅ Créer notification personnalisée
   - ✅ Sélectionner tous SUPERVISEURS
   - ✅ Envoyer invitation

4. **Vérification**:
   - ✅ Retour "Calendrier & Sessions"
   - ✅ Session visible dans calendrier
   - ✅ Status = "scheduled"
   - ✅ 0/10 participants inscrits initialement

### Scénario 5: Audit de Conformité

**Objectif**: Vérifier la conformité globale avant audit externe

1. **État des lieux**:
   - ✅ Dashboard HSE - KPI "Taux de conformité"
   - ✅ Onglet "Collaborateurs" - Statistiques globales
   - ✅ Identifier employés <70% (rouge)

2. **Actions correctives**:
   - ✅ Pour chaque employé non conforme:
     - Voir détail formations manquantes
     - Assigner formations prioritaires
     - Programmer sessions urgentes
     - Envoyer notification avec échéance

3. **Rapport**:
   - ✅ Onglet "Analyses & Rapports"
   - ✅ HSEAnalyticsDashboard
   - ✅ Voir graphiques:
     - Conformité par service
     - Évolution incidents
     - Taux completion formations
   - ✅ Exporter rapport PDF pour direction

4. **Matrice service**:
   - ✅ Onglet "Attribution Auto" → "Matrice conformité"
   - ✅ Vue par service (Production, Maintenance, etc.)
   - ✅ Formations requises par service
   - ✅ Couverture actuelle

## 📊 Indicateurs de Succès

### Conformité
- [ ] Taux global ≥ 90% (vert)
- [ ] Aucun employé <70% en Production/Maintenance
- [ ] Formations critiques (H2S, Espace confiné) = 100%

### Réactivité
- [ ] Incidents HIGH traités en <24h
- [ ] Notifications envoyées en <5 min
- [ ] Sessions programmées dans les 7 jours suivant attribution

### Traçabilité
- [ ] Tous incidents documentés avec photos
- [ ] Historique complet formations par employé
- [ ] Preuves notifications envoyées (timestamps)

### Automatisation
- [ ] 6 règles d'attribution actives
- [ ] Attribution automatique fonctionne (toast confirmation)
- [ ] Rappels automatiques avant expiration (si implémenté)

## 🚨 Points d'Attention

### Formations Critiques SOGARA
Ces formations nécessitent une attention particulière (priorité HIGH):

1. **HSE-015 (H2S)** - Personnel Production
   - Gaz mortel, score minimum 100%
   - Renouvellement annuel obligatoire
   - Test pratique avec ARI (Appareil Respiratoire Isolant)

2. **HSE-004 (Espace Confiné)** - Techniciens
   - Permis d'entrée obligatoire
   - Surveillance atmosphérique
   - Procédures sauvetage

3. **HSE-005 (Travail en Hauteur)** - Maintenance
   - Harnais antichute
   - Inspection quotidienne équipements
   - Ancrage certifié

### Conformité Réglementaire
- **ISO 45001:2018** (Santé et sécurité)
- **ISO 14001:2015** (Management environnemental)
- **Code du Travail Gabonais**
- **Normes OSHA** (raffinerie)
- **API** (American Petroleum Institute)

### Communication d'Urgence
En cas d'incident critique:
1. Déclaration immédiate dans système
2. Notification "hse_incident_high" → tous concernés
3. Briefing sécurité si nécessaire
4. Rapport détaillé sous 24h

## 🎓 Formations par Poste (Référence Rapide)

### Production (Techniciens)
- ✅ HSE-001 : Induction obligatoire
- ⚠️ HSE-015 : H2S (CRITIQUE)
- ✅ HSE-002 : EPI avancé
- ✅ HSE-003 : Incendie
- ✅ HSE-004 : Espace confiné
- ✅ HSE-006 : Produits chimiques
- ✅ HSE-008 : SST

### Maintenance
- ✅ HSE-001 : Induction obligatoire
- ✅ HSE-002 : EPI avancé
- ✅ HSE-003 : Incendie
- ✅ HSE-005 : Travail en hauteur
- ✅ HSE-007 : Permis de travail
- ✅ HSE-008 : SST

### Superviseurs
- ✅ HSE-001 : Induction obligatoire
- ✅ HSE-007 : Permis de travail (émetteur)
- ✅ HSE-008 : SST (obligatoire)
- ✅ Toutes formations des équipes supervisées

### Administratif
- ✅ HSE-001 : Induction obligatoire
- ✅ HSE-003 : Incendie (évacuation)
- ⭕ HSE-008 : SST (recommandé)

---

## 🎯 Prochaines Étapes (Post-Test)

### Optimisations Possibles
- [ ] Rappels automatiques email (à J-30, J-15, J-7)
- [ ] Dashboard mobile pour superviseurs terrain
- [ ] Signature électronique attestations
- [ ] Intégration badges RFID (check-in formations)
- [ ] Module évaluation post-formation
- [ ] Gamification (badges, classements services)

### Reporting Avancé
- [ ] Export Excel conformité par service
- [ ] Génération automatique rapports mensuels
- [ ] Tableaux de bord PowerBI/Tableau
- [ ] Alertes SMS pour incidents critiques

---

**Version**: 1.0  
**Date**: 2025-01-09  
**Responsable**: Responsable HSE (HSE001)  
**Statut**: ✅ Système Opérationnel
