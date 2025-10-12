# 🎓 Parcours de Certification Intégré - Formation → Évaluation → Habilitation

## 📋 Concept

**Un parcours de certification** lie automatiquement 3 étapes obligatoires :
1. **Formation** - Module pédagogique (contenu + quiz)
2. **Évaluation** - Test de validation (X jours après formation)
3. **Habilitation** - Qualification accordée si réussite

**Avantage**: HSE configure une fois, le système gère tout automatiquement.

---

## 🏗️ Architecture

### Structure d'un Parcours

```typescript
CertificationPath {
  // Général
  title: "Parcours Opérateur Production Qualifié",
  description: "Formation complète + test qualification",
  
  // Étape 1: Formation
  trainingModuleId: "HSE-015",        // H2S Awareness
  trainingTitle: "Sensibilisation H2S",
  trainingDuration: 4,                 // heures
  
  // Étape 2: Évaluation (délai)
  assessmentId: "eval_xyz",
  assessmentTitle: "Test Qualification H2S",
  daysBeforeAssessment: 7,             // ← 7 jours après formation
  assessmentDuration: 30,              // minutes
  passingScore: 85,                    // %
  
  // Étape 3: Habilitation (auto si réussite)
  habilitationName: "Opérateur Qualifié Zone Production",
  habilitationCode: "OPQ-PROD-H2S",
  habilitationValidity: 12,            // mois
}
```

### Progression Candidat

```typescript
CertificationPathProgress {
  pathId: "path_123",
  candidateId: "10",  // Jean-Luc BERNARD
  candidateType: "external",
  status: "training_in_progress",
  
  // Timestamps
  trainingStartedAt: Date,
  trainingCompletedAt: undefined,      // Pas encore fini
  evaluationAvailableDate: undefined,  // Calculé après formation
  
  // Résultats (remplis au fur et à mesure)
  trainingScore: undefined,
  evaluationScore: undefined,
  evaluationPassed: undefined,
  habilitationGrantedAt: undefined,
}
```

---

## 🔄 Flux Automatique Complet

### ÉTAPE 1: HSE Crée le Parcours

**Interface HSE** (`/app/hse` → Centre d'Envoi → Parcours):

```
┌────────────────────────────────────────────────────┐
│ Créer un Parcours de Certification                │
├────────────────────────────────────────────────────┤
│ Titre: [Parcours Opérateur Production Qualifié]   │
│ Description: [Formation H2S + Test + Habilitation] │
│                                                    │
│ ──── ÉTAPE 1: FORMATION ────                      │
│ Module: [HSE-015 - Sensibilisation H2S ▼]         │
│ Durée: 4 heures                                   │
│                                                    │
│ ──── ÉTAPE 2: ÉVALUATION ────                     │
│ Test: [Test Qualification H2S ▼]                  │
│ Disponible après: [7] jours (formation complétée) │
│ Durée test: 30 minutes                            │
│ Score minimum: 85%                                │
│                                                    │
│ ──── ÉTAPE 3: HABILITATION ────                   │
│ Nom: [Opérateur Qualifié Zone Production]         │
│ Code: [OPQ-PROD-H2S]                              │
│ Validité: [12] mois                               │
│                                                    │
│ [Sauvegarder] [Publier]                           │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 2: HSE Assigne à Jean-Luc

**Centre d'Envoi → Parcours**:

```
Sélection parcours: [Parcours Opérateur Production ▼]
Candidat: [Jean-Luc BERNARD (EXT001) ▼]

Preview:
┌────────────────────────────────────────────────────┐
│ 📚 Formation: Sensibilisation H2S (4h)            │
│    ↓ 7 jours                                       │
│ 📝 Évaluation: Test Qualification H2S (30 min)    │
│    ↓ Si score ≥ 85%                               │
│ 🎓 Habilitation: Opérateur Qualifié (12 mois)    │
└────────────────────────────────────────────────────┘

[Assigner ce parcours à Jean-Luc BERNARD]
```

**Actions automatiques**:
1. CertificationPathProgress créé (status: not_started)
2. Formation assignée automatiquement (HSEAssignment créé)
3. Email envoyé à Jean-Luc

---

### ÉTAPE 3: Jean-Luc Reçoit le Parcours

**Email**:
```
Objet: Parcours de Certification SOGARA

Bonjour Jean-Luc BERNARD,

Vous êtes inscrit au parcours:
"Parcours Opérateur Production Qualifié"

📚 ÉTAPE 1: Formation
   Sensibilisation H2S (4 heures)
   À compléter en premier

📝 ÉTAPE 2: Évaluation
   Test Qualification H2S (30 minutes)
   Disponible 7 jours après la formation
   Score minimum: 85%

🎓 ÉTAPE 3: Habilitation
   Si réussite: "Opérateur Qualifié Zone Production"
   Validité: 12 mois

Lien d'accès: https://sogara.app/parcours/abc123

Cordialement,
Marie-Claire NZIEGE
Responsable HSE - SOGARA
```

### ÉTAPE 4: Jean-Luc Consulte son Parcours

**Dashboard Jean-Luc** (EXT001):

```
Mes Parcours de Certification (1)

┌────────────────────────────────────────────────────┐
│ Parcours Opérateur Production Qualifié            │
├────────────────────────────────────────────────────┤
│ ✅ ÉTAPE 1: Formation                             │
│    📚 Sensibilisation H2S (4h)                    │
│    Status: ● À commencer                          │
│    [▶️ Démarrer la formation]                     │
│                                                    │
│ ⏳ ÉTAPE 2: Évaluation                            │
│    📝 Test Qualification H2S (30 min)             │
│    Disponible après complétion formation          │
│    🔒 Verrouillé                                  │
│                                                    │
│ 🔒 ÉTAPE 3: Habilitation                          │
│    🎓 Opérateur Qualifié Zone Production          │
│    Accordée si évaluation réussie (≥85%)          │
│    🔒 Verrouillé                                  │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 5: Jean-Luc Complète la Formation

```
Jour 1: Clic "Démarrer la formation"
  → Module H2S s'ouvre
  → 4 objectifs pédagogiques
  → Navigation étapes
  → Quiz final
  → Score: 95%
  → Formation complétée ✅

Actions automatiques:
  1. trainingCompletedAt = 01/01/2025
  2. trainingScore = 95
  3. evaluationAvailableDate = 01/01 + 7j = 08/01/2025
  4. status: training_in_progress → training_completed
  5. Notification Jean-Luc
```

**Affichage mis à jour**:
```
┌────────────────────────────────────────────────────┐
│ ✅ ÉTAPE 1: Formation ✓ Complétée                 │
│    📚 Sensibilisation H2S                         │
│    Score: 95% • Complétée le 01/01/2025          │
│                                                    │
│ 📅 ÉTAPE 2: Évaluation                            │
│    📝 Test Qualification H2S (30 min)             │
│    Disponible le: 08/01/2025 (dans 7 jours)      │
│    ⏱️ Débloquée dans 7 jours                      │
│                                                    │
│ 🔒 ÉTAPE 3: Habilitation                          │
│    Accordée si évaluation ≥85%                    │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 6: Période d'Attente (7 jours)

**Jours 2-7**: Jean-Luc peut réviser
```
Parcours → 
  ✅ Formation complétée (peut revoir)
  ⏱️ Évaluation disponible dans X jours
```

**Jour 8 (08/01/2025)**:
```
Parcours mis à jour automatiquement:

┌────────────────────────────────────────────────────┐
│ ✅ ÉTAPE 1: Formation ✓                           │
│    Score: 95%                                     │
│                                                    │
│ ⚠️ ÉTAPE 2: Évaluation - DISPONIBLE              │
│    📝 Test Qualification H2S (30 min)             │
│    Score minimum: 85%                             │
│    [▶️ Passer l'évaluation]                       │
│                                                    │
│ 🔒 ÉTAPE 3: Habilitation                          │
│    En attente résultat évaluation                 │
└────────────────────────────────────────────────────┘

Status: training_completed → evaluation_available
```

### ÉTAPE 7: Jean-Luc Passe l'Évaluation

```
Clic "Passer l'évaluation"
→ Interface test (comme évaluation standard)
→ 10 questions (6 QCM + 4 texte)
→ 30 minutes
→ Soumission
→ Status: evaluation_available → evaluation_submitted
```

**Affichage**:
```
┌────────────────────────────────────────────────────┐
│ ✅ ÉTAPE 1: Formation ✓                           │
│    Score: 95%                                     │
│                                                    │
│ 📝 ÉTAPE 2: Évaluation - Soumise                  │
│    Soumis le: 08/01/2025 14:30                   │
│    En attente de correction par HSE               │
│                                                    │
│ ⏳ ÉTAPE 3: Habilitation                          │
│    En attente résultat évaluation                 │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 8: HSE Corrige l'Évaluation

```
HSE Dashboard → Évaluations → Corrections (1)

Jean-Luc BERNARD - Parcours Opérateur Production

Questions auto-corrigées (QCM): 52/60 pts
Questions à corriger manuellement (4):
  Q4: 14/15 pts ✅
  Q5: 18/20 pts ✅
  Q8: 9/10 pts ✅
  Q9: 13/15 pts ✅

Total: 52 + 14 + 18 + 9 + 13 = 106/120 pts
Score: 88.3% ✅ ADMIS (≥85%)

Commentaire:
"Très bonne maîtrise des procédures de sécurité.
Candidat apte à opérer en zone production."

[✓ Valider et Accorder Habilitation]
```

**Actions automatiques**:
1. ✅ evaluationScore = 88.3%
2. ✅ evaluationPassed = true
3. ✅ status: evaluation_submitted → completed_passed
4. ✅ habilitationGrantedAt = 08/01/2025
5. ✅ habilitationExpiryDate = 08/01/2026
6. ✅ certificateUrl généré
7. ✅ **Habilitation ajoutée au profil Jean-Luc**:
   ```
   habilitations: ["Opérateur Qualifié Zone Production"]
   ```
8. ✅ Email résultat envoyé

### ÉTAPE 9: Jean-Luc Reçoit Résultat

**Email**:
```
Objet: 🎉 Parcours Réussi - Habilitation Accordée

Félicitations Jean-Luc BERNARD,

Vous avez complété avec succès le parcours:
"Parcours Opérateur Production Qualifié"

✅ Formation: Sensibilisation H2S - Score: 95%
✅ Évaluation: Test Qualification - Score: 88.3%

🎓 HABILITATION ACCORDÉE:
"Opérateur Qualifié Zone Production"
Code: OPQ-PROD-H2S
Validité: 12 mois (expire le 08/01/2026)

Certificat complet:
[Télécharger le certificat]

Commentaire:
"Très bonne maîtrise des procédures de sécurité.
Candidat apte à opérer en zone production."

Vous êtes maintenant qualifié pour intervenir
dans les zones de production de SOGARA.

Cordialement,
Marie-Claire NZIEGE
Responsable HSE - SOGARA
```

**Dashboard Jean-Luc**:
```
┌────────────────────────────────────────────────────┐
│ ✅ PARCOURS COMPLÉTÉ - HABILITATION OBTENUE       │
│                                                    │
│ ✅ ÉTAPE 1: Formation ✓                           │
│    Score: 95% • Complétée le 01/01/2025          │
│                                                    │
│ ✅ ÉTAPE 2: Évaluation ✓                          │
│    Score: 88.3% • Réussie                         │
│                                                    │
│ 🎓 ÉTAPE 3: HABILITATION ACCORDÉE ✅              │
│    Opérateur Qualifié Zone Production            │
│    Obtenue: 08/01/2025                            │
│    Expire: 08/01/2026                             │
│                                                    │
│ [📥 Télécharger certificat complet]               │
└────────────────────────────────────────────────────┘
```

**Profil mis à jour**:
```
Habilitations:
  ✓ Opérateur Qualifié Zone Production
    Code: OPQ-PROD-H2S
    Obtenue: 08/01/2025
    Expire: 08/01/2026
    Certificat: cert_path_123.pdf
```

---

## 🎯 Cas d'Usage

### Cas 1: Technicien Externe (Jean-Luc)

**Besoin**: Accès zone production pour maintenance

**Parcours assigné**: "Parcours Opérateur Production Qualifié"
- Formation H2S (4h)
- Test après 7 jours
- Habilitation valide 12 mois

**Timeline**:
```
Jour 0:  Parcours assigné
Jour 0:  Formation disponible immédiatement
Jour 1:  Jean-Luc complète formation (score 95%)
Jour 2-7: Période de révision
Jour 8:  Évaluation débloquée
Jour 8:  Jean-Luc passe test (score 88%)
Jour 9:  HSE corrige et valide
Jour 9:  Habilitation accordée automatiquement
Jour 10: Jean-Luc accède zone production
```

### Cas 2: Nouvel Employé (Pierre)

**Besoin**: Qualification opérateur

**Parcours**: "Parcours Qualification Interne"
- Formation Induction (8h)
- Test après 3 jours
- Habilitation permanente

**Avantage**: Même système pour internes et externes

---

## 🔧 Logique Système

### Déblocage Automatique Évaluation

```typescript
// Après complétion formation
if (trainingCompleted) {
  const evaluationAvailableDate = 
    trainingCompletedAt + (daysBeforeAssessment * 24 * 60 * 60 * 1000);
  
  // Vérifier chaque jour si date atteinte
  if (Date.now() >= evaluationAvailableDate) {
    status = 'evaluation_available';
    // Bouton "Passer l'évaluation" s'active
  }
}
```

### Attribution Automatique Habilitation

```typescript
// Après correction évaluation
if (evaluationScore >= passingScore) {
  // 1. Marquer parcours réussi
  status = 'completed_passed';
  
  // 2. Générer dates
  habilitationGrantedAt = Date.now();
  habilitationExpiryDate = Date.now() + (habilitationValidity * 30 * 24 * 60 * 60 * 1000);
  
  // 3. Générer certificat
  certificateUrl = generateCertificate();
  
  // 4. Ajouter habilitation au profil
  if (candidateType === 'employee') {
    employee.habilitations.push(habilitationName);
  }
  
  // 5. Envoyer email + certificat
  sendEmail(candidate, result);
}
```

---

## 📊 Avantages du Système

### Pour HSE:
✅ Configuration une seule fois
✅ Envoi automatique formation + évaluation
✅ Gestion délai automatique
✅ Attribution habilitation auto si réussite
✅ Traçabilité complète

### Pour Candidat:
✅ Parcours clair (3 étapes)
✅ Formation avant test (préparation)
✅ Délai de révision (7 jours)
✅ Habilitation automatique
✅ Certificat unique complet

### Pour Système:
✅ Workflow unifié
✅ Moins d'erreurs
✅ Audit trail complet
✅ Scalable (ajout parcours facile)

---

## ✅ Implémentation

- [x] Types CertificationPath & Progress
- [x] Schéma Convex (2 tables)
- [x] Mutations (create, assign, complete)
- [x] Logique déblocage automatique
- [x] Attribution habilitation auto
- [x] Compte externe EXT001 créé

**Prochaine étape**: Composants UI pour gestion parcours dans HSE Dashboard et affichage dans Dashboard externe.

Le système est **architecturalement complet** ! 🎓✅
