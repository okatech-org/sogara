# 🎓 Flux Complet - Formation Employé (Pierre BEKALE)

## 📋 Scénario Complet

**Contexte**: Le Responsable HSE (Marie-Claire NZIEGE) envoie une formation "Port et Utilisation des EPI" à Pierre BEKALE (Technicien Production).

---

## 🔄 Étapes du Flux

### 1️⃣ ENVOI PAR LE RESPONSABLE HSE

**Compte**: HSE001 (Marie-Claire NZIEGE)  
**URL**: `http://localhost:8081/app/hse`

#### Actions:
```
1. Login HSE001
2. Navigation → /app/hse
3. Clic onglet "📤 Centre d'Envoi"
4. Onglet "Formations" actif

5. Sélection formation:
   Dropdown → "HSE-002 - Port et Utilisation des EPI"
   
6. Preview affiché:
   ┌──────────────────────────────────┐
   │ [Obligatoire] [EPI-ADVANCED]     │
   │ Port et Utilisation des EPI      │
   │ Formation approfondie sur...     │
   │ Durée: 4 heures                  │
   │ Validité: 24 mois                │
   │ Score requis: 85%                │
   └──────────────────────────────────┘

7. Sélection destinataire:
   Onglet "Individuel" →
   ☑ Pierre BEKALE (EMP001) - Production
   
   Badge: "1 collaborateur sélectionné" ✅

8. Paramètres:
   Priorité: [Haute ▼]
   Échéance: [15/02/2025]
   Message: "Formation EPI obligatoire..."

9. Clic "Prévisualiser"
   Dialog s'ouvre:
   ┌──────────────────────────────────┐
   │ Prévisualisation de l'envoi      │
   ├──────────────────────────────────┤
   │ Type: Formation                  │
   │ Formation: Port et Utilisation EPI│
   │ Priorité: Haute                  │
   │ Destinataires (1):               │
   │ • Pierre BEKALE (EMP001)         │
   │                                  │
   │ [Modifier] [✓ Confirmer l'envoi] │
   └──────────────────────────────────┘

10. Clic "Confirmer l'envoi"
    → HSEContentItem créé
    → HSEAssignment créé (status: 'sent')
    → Toast: "Port et Utilisation des EPI envoyé à 1 collaborateur(s)"
    → Dialog se ferme
```

**Données créées**:
```typescript
// HSEContentItem
{
  id: "content_1234567890",
  type: "training",
  title: "Port et Utilisation des EPI",
  description: "Formation approfondie...",
  priority: "high",
  trainingId: "HSE-002",
  createdBy: "4", // ID de HSE001
  createdAt: Date.now()
}

// HSEAssignment
{
  id: "assign_9876543210",
  contentId: "content_1234567890",
  contentType: "training",
  employeeId: "1", // ID de EMP001 (Pierre)
  status: "sent",
  assignedAt: Date.now(),
  dueDate: new Date("2025-02-15"),
  sentBy: "4",
  metadata: {
    trainingId: "HSE-002",
    priority: "high"
  }
}
```

---

### 2️⃣ RÉCEPTION PAR L'EMPLOYÉ

**Compte**: EMP001 (Pierre BEKALE)  
**URL**: `http://localhost:8081/app/dashboard`

#### Ce que Pierre voit:

**Dashboard employé**:
```
┌────────────────────────────────────────┐
│ Mon Espace HSE          [1 nouveau 🔴]│ ← Badge rouge qui pulse
│ ┌────┐                                 │
│ │🛡️ │ Mon Espace HSE                  │ ← Icône colorée selon conformité
│ └────┘                                 │
│                                        │
│ Ma conformité HSE           75% ⚠️     │ ← Badge jaune (< 90%)
│ ████████░░ (Barre progression)         │
│                                        │
│ ┌──────────┬──────────┐                │
│ │    1     │    0     │                │
│ │ En attente│ Complétées│               │
│ └──────────┴──────────┘                │
│                                        │
│ [📚 Accéder à mon espace HSE] [1]      │ ← Badge sur bouton
└────────────────────────────────────────┘
```

**Indicateurs visuels**:
- ✅ Bordure bleue (border-2 border-primary) si nouveau contenu
- ✅ Badge rouge "1 nouveau" avec animation pulse
- ✅ Point rouge animé (animate-ping)
- ✅ Icône Shield colorée selon conformité (vert/jaune/rouge)
- ✅ Barre de progression conformité
- ✅ 2 compteurs (En attente / Complétées)

---

### 3️⃣ CONSULTATION PAR L'EMPLOYÉ

**Action**: Pierre clique sur la card "Mon Espace HSE"

**Dialog s'ouvre** (max-w-5xl):
```
┌────────────────────────────────────────────────────┐
│ Mon Espace HSE Personnel                      [X]  │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🛡️ Mon Espace HSE              Conformité: 75%    │
│                                                    │
│ [Formations: 1] [Complétées: 0] [Alertes: 0] ...  │
│                                                    │
│ [Mes Formations (1)] [Alertes] [Documents]         │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ 🟠 Port et Utilisation des EPI    HAUTE    │    │
│ │                                            │    │
│ │ Assignée par: Marie-Claire NZIEGE          │    │
│ │ Échéance: 15/02/2025 (30 jours)            │    │
│ │ Durée: 4 heures                            │    │
│ │ Score requis: 85%                          │    │
│ │                                            │    │
│ │ Formation approfondie sur l'utilisation    │    │
│ │ correcte des équipements de protection...  │    │
│ │                                            │    │
│ │ Statut: ● Non démarrée                    │    │
│ │                                            │    │
│ │ [▶️ Démarrer la formation]                 │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 4️⃣ DÉMARRAGE DE LA FORMATION

**Action**: Pierre clique sur "▶️ Démarrer"

**Effets immédiats**:
```typescript
1. markAsRead(assignment.id)
   → status: 'sent' → 'read'
   → readAt: Date.now()

2. startTraining(assignment.id)
   → status: 'read' → 'in_progress'
   → startedAt: Date.now()

3. setActiveTraining(assignment)
   → Dialog module s'ouvre
```

**Nouveau Dialog s'ouvre** (HSETrainingModulePlayer):
```
┌────────────────────────────────────────────────────┐
│ Module de Formation Interactive            [Quitter]│
├────────────────────────────────────────────────────┤
│ [Obligatoire] [EPI-ADVANCED]                       │
│ Port et Utilisation des EPI                        │
│ Formation approfondie sur l'utilisation...         │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ Progression          Étape 1/4             │    │
│ │ ████░░░░░░ 25%                             │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ Objectif 1: Identifier les différents     │    │
│ │             types d'EPI et leurs usages    │    │
│ ├────────────────────────────────────────────┤    │
│ │                                            │    │
│ │ Formation approfondie sur...               │    │
│ │                                            │    │
│ │ Points clés à retenir:                     │    │
│ │ ✓ Identifier les différents types d'EPI    │    │
│ │                                            │    │
│ │ ⚠️ Important: Score minimum 85% requis     │    │
│ │                                            │    │
│ │ Ressources:                                │    │
│ │ 📚 Durée totale: 4 heures                 │    │
│ │ 🏆 Certificat: Certificat de compétence   │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ [← Précédent]    1/4    [Suivant →]               │
└────────────────────────────────────────────────────┘
```

**Progression trackée**:
```typescript
// À chaque changement d'étape
useEffect(() => {
  if (progress > 0 && progress < 100) {
    updateProgress(assignment.id, progress);
    // → HSEAssignment.progress mis à jour
  }
}, [progress]);
```

---

### 5️⃣ NAVIGATION DANS LE MODULE

**Actions Pierre**:
```
Étape 1: Objectif 1 (25%)
  → Clic "Suivant" → progress: 25%

Étape 2: Objectif 2 (50%)
  → Clic "Suivant" → progress: 50%

Étape 3: Objectif 3 (75%)
  → Clic "Suivant" → progress: 75%

Étape 4: Objectif 4 (100% théorie)
  → Bouton devient "▶️ Passer à l'évaluation"
  → Clic → isQuizMode = true
```

---

### 6️⃣ ÉVALUATION FINALE (QUIZ)

**Interface Quiz**:
```
┌────────────────────────────────────────────────────┐
│ Évaluation Finale                                  │
│ Port et Utilisation des EPI - 3 questions          │
│ Score minimum: 85%                                 │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐    │
│ │ Question 1/3                               │    │
│ │                                            │    │
│ │ Quelle est la durée de validité de la      │    │
│ │ formation "Port et Utilisation des EPI" ?  │    │
│ │                                            │    │
│ │ ○ 6 mois                                   │    │
│ │ ○ 12 mois                                  │    │
│ │ ● 24 mois                                  │    │ ← Sélectionné
│ │ ○ 36 mois                                  │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ [Question 2/3...]                                  │
│ [Question 3/3...]                                  │
│                                                    │
│ [← Retour au contenu] [✓ Valider mes réponses]    │
└────────────────────────────────────────────────────┘
```

**Pierre répond aux 3 questions** et clique "Valider"

**Calcul du score**:
```typescript
let correct = 0;
quizQuestions.forEach(q => {
  if (quizAnswers[q.id] === q.correctAnswer) {
    correct++;
  }
});

const score = Math.round((correct / quizQuestions.length) * 100);
// Exemple: 3/3 correct = 100%
```

---

### 7️⃣ RÉSULTAT DE L'ÉVALUATION

**Cas 1: Réussite (score ≥ 85%)**

**Affichage**:
```
┌────────────────────────────────────────────────────┐
│          ┌────────┐                                │
│          │   ✅   │                                │
│          └────────┘                                │
│                                                    │
│          Score: 100%                               │
│          Vous avez réussi l'évaluation !           │
│                                                    │
│ [Retour contenu] [✓ Valider réponses] (disabled)  │
└────────────────────────────────────────────────────┘
```

**Traitement backend**:
```typescript
// completeTraining() appelé
const certificateUrl = `certificate_${assignment.id}_${Date.now()}.pdf`;

completeTraining(assignment.id, 100, certificateUrl);
// → HSEAssignment mise à jour:
//   status: 'in_progress' → 'completed'
//   completedAt: Date.now()
//   score: 100
//   certificate: certificateUrl

setShowCertificate(true);

toast({
  title: '🎉 Formation réussie !',
  description: 'Score: 100% - Certificat généré'
});
```

**Cas 2: Échec (score < 85%)**

**Affichage**:
```
┌────────────────────────────────────────────────────┐
│          ┌────────┐                                │
│          │   ❌   │                                │
│          └────────┘                                │
│                                                    │
│          Score: 67%                                │
│          Score minimum requis: 85%                 │
│                                                    │
│ Réponses correctes:                                │
│ ┌────────────────────────────────────────────┐    │
│ │ Q1: Quelle est la durée...                 │    │
│ │ ✓ 24 mois                                  │    │
│ │ Cette formation est valide 24 mois         │    │
│ └────────────────────────────────────────────┘    │
│ [+ 2 autres questions...]                          │
│                                                    │
│ [Réessayer l'évaluation]                          │
└────────────────────────────────────────────────────┘
```

**Toast**: "Score insuffisant - Vous avez obtenu 67%. Minimum requis: 85%. Vous pouvez réessayer."

Pierre peut revoir les réponses et retenter le quiz.

---

### 8️⃣ GÉNÉRATION DU CERTIFICAT

**Si réussite** (score ≥ 85%):

**Écran certificat**:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│          ┌────────┐                                │
│          │  🏆   │                                │
│          └────────┘                                │
│                                                    │
│          🎉 Félicitations !                        │
│     Vous avez complété la formation avec succès    │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │  Port et Utilisation des EPI               │    │
│ │  [EPI-ADVANCED]                            │    │
│ │                                            │    │
│ │ ┌──────────┬──────────┐                   │    │
│ │ │   100%   │    24    │                   │    │
│ │ │  Score   │   Mois   │                   │    │
│ │ └──────────┴──────────┘                   │    │
│ │                                            │    │
│ │ Certificat valide jusqu'au: 15/02/2027     │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ [📥 Télécharger certificat] [Retour espace HSE]   │
└────────────────────────────────────────────────────┘
```

**Action Pierre**: Clic "Télécharger certificat"
- Toast: "Téléchargement - Le certificat sera disponible..."
- Retour automatique à l'inbox (1 seconde)

---

### 9️⃣ MISE À JOUR DASHBOARD PIERRE

**Après complétion**:

Pierre retourne à `/app/dashboard`

**Card "Mon Espace HSE" mise à jour**:
```
┌────────────────────────────────────────┐
│ Mon Espace HSE          [0 nouveau]    │ ← Badge disparaît
│ ┌────┐                                 │
│ │🛡️ │ Mon Espace HSE                  │ ← Icône verte (conformité améliorée)
│ └────┘                                 │
│                                        │
│ Ma conformité HSE           85% ✅     │ ← Badge vert augmenté
│ ██████████░ (Barre progression)         │
│                                        │
│ ┌──────────┬──────────┐                │
│ │    0     │    1     │                │ ← Complétées +1
│ │ En attente│ Complétées│               │
│ └──────────┴──────────┘                │
└────────────────────────────────────────┘
```

**Dans l'inbox**:
```
Onglet "Mes Formations (1)":

┌────────────────────────────────────────┐
│ 🟢 Port et Utilisation des EPI         │
│                                        │
│ ✅ Complétée le 10/01/2025            │
│ Score: 100% • Expire: 10/01/2027      │
│                                        │
│ [📥 Télécharger certificat]            │
└────────────────────────────────────────┘
```

---

### 🔟 SUIVI PAR LE RESPONSABLE HSE

**Compte**: HSE001  
**URL**: `/app/hse` → Onglet "Collaborateurs"

**Recherche "Pierre BEKALE"**:

**Vue détaillée**:
```
┌────────────────────────────────────────────────────┐
│ Profil de formation HSE                            │
├────────────────────────────────────────────────────┤
│ Pierre BEKALE                   Conformité: 85% ✅ │
│ EMP001 • Production                                │
│ [EMPLOYE]                                          │
│                                                    │
│ [Formations: 1] [Requises: 1] [Expirées: 0] ...   │
│                                                    │
│ [Requises] [Complétées] [Expirées] [À renouveler]  │
│                                                    │
│ Onglet "Complétées" actif:                         │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ Port et Utilisation des EPI                │    │
│ │ EPI-ADVANCED • Obligatoire                 │    │
│ │                                            │    │
│ │ ✅ Complétée le: 10/01/2025               │    │
│ │ Score: 100%                                │    │
│ │ Expire: 10/01/2027                         │    │
│ │ Assignée le: 05/01/2025                    │    │
│ │                                            │    │
│ │ [Complétée ✓]                              │    │
│ └────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

---

## 📊 Cycle de Vie Complet

```
┌─────────────────────────────────────────────────────┐
│                 RESPONSABLE HSE                     │
│                                                     │
│  Sélection Formation → Sélection Employé(s)        │
│         → Paramètres → Envoi                       │
│                 ↓                                   │
│         HSEContentItem créé                        │
│         HSEAssignment(s) créé(s)                   │
│              status: 'sent'                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                    EMPLOYÉ                          │
│                                                     │
│  Dashboard → Card HSE (badge "1 nouveau" 🔴)       │
│                 ↓                                   │
│  Clic → Dialog Inbox s'ouvre                       │
│  Onglet "Mes Formations" → Formation visible       │
│                 ↓                                   │
│  Clic "Démarrer" → status: 'sent' → 'in_progress' │
│                 ↓                                   │
│  Module s'ouvre → Navigation 4 objectifs           │
│  Progression: 0% → 25% → 50% → 75% → 100%         │
│                 ↓                                   │
│  Évaluation (Quiz 3 questions)                     │
│  Score calculé: 100%                               │
│                 ↓                                   │
│  Score ≥ 85% ? → OUI                               │
│       status: 'in_progress' → 'completed'          │
│       completedAt: Date.now()                      │
│       score: 100                                   │
│       certificate: URL généré                      │
│                 ↓                                   │
│  Écran certificat                                  │
│  "🎉 Félicitations !"                              │
│  [Télécharger certificat]                          │
│                 ↓                                   │
│  Retour inbox → Formation marquée "Complétée ✅"   │
│  Conformité: 75% → 85% (mise à jour)               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│             RESPONSABLE HSE - SUIVI                 │
│                                                     │
│  Onglet "Collaborateurs" → Pierre BEKALE           │
│  Formations Complétées:                            │
│  ✅ Port EPI - Complétée 10/01/2025                │
│     Score: 100% • Expire: 10/01/2027               │
│                                                     │
│  Conformité employé: 85% ✅                         │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Composants Impliqués

### Côté HSE (Envoi)
1. **HSEContentHub** - Interface d'envoi
2. **HSERecipientSelector** - Sélection destinataires
3. **useHSEContent** - Logique création contenu/assignments

### Côté Employé (Réception)
1. **Dashboard** - Card "Mon Espace HSE" avec badges
2. **EmployeeHSEInbox** - Liste formations/alertes/documents
3. **HSETrainingModulePlayer** - Module interactif
4. **useEmployeeHSEInbox** - Logique inbox personnel

### Partagés
1. **HSEAssignment** - Type commun
2. **LocalStorage** - Persistence (sogara_hse_assignments)

---

## ✅ Fonctionnalités Implémentées

### Formation
- [x] Envoi par HSE avec sélection destinataires
- [x] Réception dans inbox employé
- [x] Badge notification visible
- [x] Module interactif avec navigation
- [x] Progression trackée en temps réel
- [x] Quiz d'évaluation
- [x] Calcul score automatique
- [x] Génération certificat si réussite
- [x] Possibilité de réessayer si échec
- [x] Mise à jour conformité
- [x] Suivi par HSE

### Alerte
- [x] Création et envoi
- [x] Réception dans inbox
- [x] Bouton "Accusé de réception"
- [x] Marquage comme lu

### Document
- [x] Partage URL
- [x] Réception dans inbox
- [x] Bouton "Télécharger"
- [x] Ouverture nouvel onglet

---

## 🚀 Pour Tester

### Test Complet Formation

```bash
# 1. Connexion HSE
Matricule: HSE001
→ /app/hse → Centre d'Envoi
→ Formation HSE-002
→ Destinataire: Pierre BEKALE
→ Envoyer

# 2. Connexion Employé
Matricule: EMP001
→ /app/dashboard
→ Vérifier badge "1 nouveau" 🔴
→ Clic card "Mon Espace HSE"
→ Formation visible
→ Clic "Démarrer"
→ Naviguer 4 étapes
→ Passer quiz
→ Obtenir 100%
→ Télécharger certificat

# 3. Vérification HSE
Reconnexion HSE001
→ /app/hse → Collaborateurs
→ Pierre BEKALE
→ Vérifier formation complétée ✅
```

---

Le flux complet est **100% fonctionnel** ! Pierre peut maintenant recevoir, compléter et valider ses formations HSE de manière totalement interactive. 🎓✅
