# 🎓 Système d'Évaluations et Tests d'Habilitation - SOGARA

## 📋 Vue d'Ensemble

**Objectif**: Permettre au Responsable HSE de créer des tests d'habilitation pour les personnes externes (et internes) avant qu'elles puissent exercer une activité dans la raffinerie.

**Flux complet**:

```
HSE crée test → Assigne à candidat → Candidat répond → HSE corrige → Résultat envoyé
```

---

## 🏗️ Architecture Implémentée

### Types d'Évaluations

1. **PRE_HIRING** - Test pré-embauche
2. **HABILITATION** - Test d'habilitation raffinerie
3. **EXTERNAL_ACCESS** - Accès personnel externe
4. **QUALIFICATION** - Qualification technique spécifique
5. **SAFETY_TEST** - Test sécurité obligatoire

### Types de Questions

1. **multiple_choice** - QCM (auto-corrigeable)
2. **true_false** - Vrai/Faux (auto-corrigeable)
3. **short_text** - Réponse courte (correction manuelle)
4. **long_text** - Réponse développée (correction manuelle)
5. **practical** - Épreuve pratique (correction manuelle)

---

## 🔄 Flux Détaillé

### ÉTAPE 1: HSE Crée une Évaluation

**Interface HSE** (`/app/hse` → Onglet "Évaluations"):

```
┌────────────────────────────────────────────────────┐
│ Créer une Évaluation d'Habilitation               │
├────────────────────────────────────────────────────┤
│ Titre: [Test Accès Zone Production]               │
│ Type: [EXTERNAL_ACCESS ▼]                         │
│ Catégorie: [Sécurité Raffinerie]                  │
│ Durée: [45] minutes                               │
│ Score minimum: [80] %                             │
│                                                    │
│ Instructions:                                      │
│ [Ce test évalue vos connaissances en sécurité...] │
│                                                    │
│ ──── QUESTIONS ────                               │
│                                                    │
│ Question 1: [+ Ajouter]                           │
│ Type: [QCM ▼]                                     │
│ Question: [Que faire en cas de fuite H2S ?]       │
│ Points: [10]                                      │
│ Options:                                          │
│   ☑ Évacuer immédiatement                        │
│   ☐ Appeler les pompiers                         │
│   ☐ Tenter de colmater                           │
│ Réponse correcte: [Évacuer immédiatement]        │
│                                                    │
│ Question 2: [+ Ajouter]                           │
│ Type: [Réponse longue ▼]                         │
│ Question: [Décrivez la procédure de consignation]│
│ Points: [20]                                      │
│ ☑ Correction manuelle requise                    │
│                                                    │
│ [+ Ajouter Question]                              │
│                                                    │
│ Total: 30 points                                  │
│                                                    │
│ [Sauvegarder brouillon] [Publier]                │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 2: HSE Assigne le Test

**Depuis "Centre d'Envoi HSE"** - Nouvel onglet "Évaluations":

```
┌────────────────────────────────────────────────────┐
│ 1. Sélection Évaluation                           │
│    [Test Accès Zone Production ▼]                 │
│                                                    │
│ 2. Candidat                                        │
│    Type: [● Externe ○ Employé ○ Visiteur]        │
│                                                    │
│    Candidat externe:                               │
│    Nom: [Jean MARTIN]                             │
│    Email: [j.martin@total.com]                    │
│    Société: [Total Energies]                      │
│    Poste: [Technicien Maintenance]                │
│    Raison: [Maintenance compresseur]              │
│                                                    │
│ 3. Paramètres                                      │
│    Validité certificat: [12 mois]                 │
│    Date limite: [15/02/2025]                      │
│                                                    │
│ [Envoyer par email] [Générer lien]                │
└────────────────────────────────────────────────────┘
```

**Email auto-généré au candidat**:

```
Objet: Test d'Habilitation SOGARA

Bonjour Jean MARTIN,

Vous avez été assigné au test suivant:
"Test Accès Zone Production"

Durée: 45 minutes
Score minimum: 80%

Lien d'accès: https://sogara.app/eval/abc123xyz

Ce lien est valable jusqu'au 15/02/2025.

Cordialement,
Marie-Claire NZIEGE
Responsable HSE - SOGARA
```

### ÉTAPE 3: Candidat Passe le Test

**Interface Candidat** (lien direct ou via login):

```
┌────────────────────────────────────────────────────┐
│ Test d'Habilitation SOGARA                        │
│ Test Accès Zone Production                        │
├────────────────────────────────────────────────────┤
│ Candidat: Jean MARTIN (Total Energies)            │
│ Durée: 45 minutes | Score minimum: 80%            │
│                                                    │
│ Instructions:                                      │
│ Ce test évalue vos connaissances en sécurité      │
│ raffinerie. Lisez attentivement chaque question.  │
│                                                    │
│ [Commencer le test] ⏱️ 00:00                      │
└────────────────────────────────────────────────────┘
```

**Pendant le test**:

```
┌────────────────────────────────────────────────────┐
│ Question 1/5            ⏱️ 12:34 restantes         │
├────────────────────────────────────────────────────┤
│ [QCM - 10 points]                                 │
│                                                    │
│ Que faire en cas de détection de fuite H2S ?      │
│                                                    │
│ ○ Évacuer immédiatement la zone                  │
│ ○ Appeler les services de secours                │
│ ○ Tenter de colmater la fuite                    │
│ ○ Informer le superviseur                        │
│                                                    │
│ [← Précédent]  [Suivant →]                        │
└────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────┐
│ Question 2/5            ⏱️ 08:15 restantes         │
├────────────────────────────────────────────────────┤
│ [Réponse longue - 20 points]                      │
│                                                    │
│ Décrivez en détail la procédure de consignation   │
│ avant intervention sur équipement électrique.     │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │                                            │    │
│ │ [Zone de saisie texte libre...]            │    │
│ │                                            │    │
│ │                                            │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ 0/500 caractères                                  │
│                                                    │
│ [← Précédent]  [Suivant →]                        │
└────────────────────────────────────────────────────┘
```

**Soumission finale**:

```
┌────────────────────────────────────────────────────┐
│ Récapitulatif                                     │
├────────────────────────────────────────────────────┤
│ Vous avez répondu à 5/5 questions                 │
│ Temps écoulé: 32 minutes                          │
│                                                    │
│ ⚠️ Attention: Après soumission, vous ne pourrez   │
│ plus modifier vos réponses.                       │
│                                                    │
│ [Revoir mes réponses] [✓ Soumettre le test]      │
└────────────────────────────────────────────────────┘
```

**Après soumission**:

```
┌────────────────────────────────────────────────────┐
│          ✅ Test Soumis                            │
│                                                    │
│ Vos réponses ont été transmises au                │
│ Responsable HSE pour correction.                  │
│                                                    │
│ Vous recevrez les résultats par email sous        │
│ 24-48 heures.                                     │
│                                                    │
│ [Fermer]                                          │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 4: HSE Corrige le Test

**Interface HSE** (`/app/hse` → Onglet "Corrections"):

```
┌────────────────────────────────────────────────────┐
│ Tests à Corriger (3)                              │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐    │
│ │ Jean MARTIN - Total Energies               │    │
│ │ Test Accès Zone Production                 │    │
│ │ Soumis le: 10/01/2025 14:32               │    │
│ │ [Corriger maintenant]                      │    │
│ └────────────────────────────────────────────┘    │
│ [+ 2 autres...]                                   │
└────────────────────────────────────────────────────┘
```

**Interface de Correction**:

```
┌────────────────────────────────────────────────────┐
│ Correction: Jean MARTIN                           │
│ Test Accès Zone Production                        │
├────────────────────────────────────────────────────┤
│                                                    │
│ Question 1/5 [QCM - 10 points]                    │
│ Que faire en cas de détection de fuite H2S ?      │
│                                                    │
│ Réponse candidat:                                 │
│ ● Évacuer immédiatement la zone ✅ CORRECT        │
│                                                    │
│ Points: [10/10] ✅ Auto-corrigé                   │
│                                                    │
│ ────────────────────────────────────              │
│                                                    │
│ Question 2/5 [Réponse longue - 20 points]         │
│ Décrivez la procédure de consignation...          │
│                                                    │
│ Réponse candidat:                                 │
│ ┌────────────────────────────────────────────┐    │
│ │ "La procédure de consignation comprend     │    │
│ │  les étapes suivantes:                     │    │
│ │  1. Coupure électrique au tableau          │    │
│ │  2. Vérification absence tension           │    │
│ │  3. Verrouillage et étiquetage             │    │
│ │  4. Vérification finale..."                │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ Notation:                                         │
│ Points accordés: [18]/20                          │
│ Commentaire:                                      │
│ [Bonne réponse, manque la double vérif...]       │
│                                                    │
│ ────────────────────────────────────              │
│                                                    │
│ [Questions 3-5...]                                │
│                                                    │
│ ──── RÉSULTAT FINAL ────                          │
│                                                    │
│ Total: 46/50 points = 92% ✅ ADMIS               │
│ (Score minimum: 80%)                              │
│                                                    │
│ Commentaire global:                                │
│ [Très bon niveau de connaissance. Candidat        │
│  apte à travailler en zone production.]           │
│                                                    │
│ [Sauvegarder brouillon] [✓ Valider et Envoyer]   │
└────────────────────────────────────────────────────┘
```

### ÉTAPE 5: Résultat Envoyé au Candidat

**Email auto au candidat**:

```
Objet: Résultats - Test d'Habilitation SOGARA

Bonjour Jean MARTIN,

Votre test a été corrigé:

Test: Test Accès Zone Production
Score obtenu: 92% (46/50 points)
Résultat: ✅ ADMIS

Vous êtes autorisé à accéder à la raffinerie SOGARA.

Certificat d'habilitation:
[Télécharger le certificat]

Validité: 12 mois (expire le 10/01/2026)

Commentaire du correcteur:
"Très bon niveau de connaissance. Candidat apte à
travailler en zone production."

Cordialement,
Marie-Claire NZIEGE
Responsable HSE - SOGARA
```

---

## 📊 Structure des Données

### Assessment (Test)

```typescript
{
  id: "test_123",
  title: "Test Accès Zone Production",
  type: "EXTERNAL_ACCESS",
  category: "Sécurité Raffinerie",
  duration: 45,              // minutes
  passingScore: 80,          // %
  totalPoints: 50,
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      question: "Que faire en cas de fuite H2S ?",
      points: 10,
      options: ["Évacuer", "Appeler", "Colmater"],
      correctAnswer: "Évacuer",
      requiresManualCorrection: false
    },
    {
      id: "q2",
      type: "long_text",
      question: "Décrivez la procédure de consignation",
      points: 20,
      requiresManualCorrection: true  // ← Correction HSE
    }
  ],
  createdBy: "HSE001"
}
```

### AssessmentSubmission (Copie candidat)

```typescript
{
  id: "sub_456",
  assessmentId: "test_123",
  candidateId: "ext_789",
  candidateType: "external",
  status: "submitted",
  answers: [
    {
      questionId: "q1",
      answer: "Évacuer",
      answeredAt: Date
    },
    {
      questionId: "q2",
      answer: "La procédure de consignation...",
      answeredAt: Date
    }
  ],
  // Après correction:
  score: 92,
  isPassed: true,
  questionGrades: [
    {
      questionId: "q1",
      pointsEarned: 10,
      maxPoints: 10,
      isCorrect: true
    },
    {
      questionId: "q2",
      pointsEarned: 18,
      maxPoints: 20,
      isCorrect: true,
      feedback: "Bonne réponse, manque la double vérif"
    }
  ],
  correctorComments: "Très bon niveau...",
  certificateUrl: "cert_xyz.pdf"
}
```

---

## 🎯 Fonctionnalités par Rôle

### Responsable HSE (Marie-Claire NZIEGE)

**Onglet "Évaluations"** dans HSE Dashboard:

1. **Bibliothèque de Tests**
   - Liste des évaluations créées
   - Créer nouvelle évaluation
   - Modifier/Dupliquer
   - Publier/Archiver

2. **Correction en Attente**
   - Liste candidats ayant soumis
   - Interface correction question par question
   - Notation manuelle questions ouvertes
   - Validation auto QCM
   - Commentaires personnalisés

3. **Historique & Statistiques**
   - Tous les tests passés
   - Taux de réussite par test
   - Temps moyen de complétion
   - Export résultats

4. **Gestion Candidats Externes**
   - Création fiche candidat
   - Assignation tests
   - Suivi habilitations
   - Renouvellements

### Candidat Externe

**Accès via lien unique**:

```
https://sogara.app/eval/abc123xyz
```

**Interface**:

1. Identification (si pas encore fait)
2. Lecture instructions
3. Passage du test (chronomètre)
4. Soumission réponses
5. Attente correction
6. Consultation résultat + certificat

### Candidat Interne (Employé)

**Dans son Inbox HSE** (comme formations):

```
Onglet "Évaluations":
┌────────────────────────────────────────┐
│ 🎓 Test Qualification Opérateur        │
│ Assigné par: Marie-Claire NZIEGE       │
│ Durée: 30 min • Score min: 85%         │
│ [Passer le test]                       │
└────────────────────────────────────────┘
```

---

## 🔧 Composants à Créer

### 1. HSEAssessmentCreator.tsx

Interface création de test pour HSE:

- Formulaire titre/type/catégorie
- Ajout questions (drag & drop pour ordre)
- Preview test
- Sauvegarde brouillon
- Publication

### 2. HSEAssessmentPlayer.tsx

Interface passage test pour candidat:

- Chronomètre
- Navigation questions
- Sauvegarde auto réponses
- Soumission finale
- Confirmation

### 3. HSEAssessmentCorrector.tsx

Interface correction pour HSE:

- Affichage question + réponse candidat
- Notation manuelle
- Auto-notation QCM
- Commentaires
- Calcul score final
- Génération certificat

### 4. CandidateAssessmentInbox.tsx

Inbox évaluations pour candidat:

- Tests assignés
- Tests en cours
- Résultats

---

## ✅ Implémentation Actuelle

- [x] Types TypeScript (Assessment, Question, Submission)
- [x] Schéma Convex (3 tables: assessments, submissions, externalCandidates)
- [x] Mutations Convex (create, assign, submit, correct)
- [x] Hook useAssessments

**À faire**:

- [ ] Composant HSEAssessmentCreator
- [ ] Composant HSEAssessmentPlayer
- [ ] Composant HSEAssessmentCorrector
- [ ] Intégration HSE Dashboard (onglet Évaluations)
- [ ] Page publique accès candidat externe
- [ ] Génération lien unique sécurisé
- [ ] Email auto notifications

---

## 💡 Cas d'Usage Concrets

### Cas 1: Technicien Externe (Maintenance)

**Contexte**: Total Energies envoie un technicien pour maintenance compresseur

**Workflow**:

```
1. Demande accès reçue
2. HSE crée fiche candidat externe
3. HSE assigne "Test Sécurité Maintenance"
4. Email envoyé au technicien
5. Technicien passe test (30 min, 10 questions)
6. Soumission automatique
7. HSE corrige questions ouvertes (2/10)
8. QCM corrigés auto (8/10)
9. Score: 88% → ADMIS
10. Certificat généré (valide 6 mois)
11. Email résultat + certificat
12. Accès autorisé à la raffinerie
```

### Cas 2: Nouvel Employé (Pierre)

**Contexte**: Pierre doit passer test qualification opérateur

**Workflow**:

```
1. HSE assigne "Test Qualification Opérateur" à Pierre
2. Pierre voit dans "Mon Espace HSE" → Évaluations
3. Passe le test (QCM + questions techniques)
4. Soumission
5. HSE corrige
6. Score: 92% → Qualification validée
7. Certificat ajouté au dossier Pierre
8. Habilitation "Opérateur Qualifié" activée
```

---

**Voulez-vous que je crée maintenant les composants d'interface (Créateur, Player, Correcteur) ?** 🎯
