# 📖 Guide Utilisateur - Système IA de Gestion de Réception

## 🎯 Introduction

Bienvenue dans le nouveau système intelligent de gestion de la réception SOGARA. Ce guide vous explique comment utiliser les fonctionnalités d'extraction automatique par IA pour les visiteurs, colis et courriers.

---

## 👥 ENREGISTRER UN VISITEUR AVEC IA

### Étape 1: Accéder à l'enregistrement

1. Allez sur la page **Visites**
2. Cliquez sur **"Nouveau visiteur"**

### Étape 2: Scanner la pièce d'identité

1. Dans le formulaire, cliquez sur **"Scanner document"**
2. Choisissez:
   - 📸 **"Prendre une photo"** - Utilisez la caméra
   - 📁 **"Télécharger un fichier"** - Sélectionnez une image

### Étape 3: Extraction automatique

1. Le système analyse le document (CNI, passeport, permis)
2. Une barre de progression s'affiche:
   - Préparation de l'image... 20%
   - Analyse par IA... 50%
   - Validation des données... 80%
   - Terminé ! 100%

### Étape 4: Vérification des données

Les champs suivants sont **pré-remplis automatiquement**:

- ✅ Prénom
- ✅ Nom
- ✅ Numéro de pièce d'identité
- ✅ Type de document
- ✅ Nationalité
- ✅ Date de naissance (si visible)

**Badge de confiance affiché:**

- 🟢 95-100% = Très fiable
- 🟡 85-94% = Vérification recommandée
- 🔴 <85% = Vérification obligatoire

### Étape 5: Compléter les informations

Ajoutez les informations complémentaires:

- Téléphone
- Email (optionnel)
- Société
- Objet de la visite
- Employé à rencontrer
- Durée estimée

### Étape 6: Validation

1. Vérifiez toutes les informations
2. Cliquez sur **"Enregistrer visiteur"**
3. Le badge est généré automatiquement avec QR Code

### Résultat

✅ Badge numéro généré (ex: B2025123456)  
✅ QR Code de traçabilité  
✅ Notification envoyée à l'employé hôte  
✅ Zones d'accès activées  
✅ Suivi en temps réel démarré

---

## 📦 ENREGISTRER UN COLIS AVEC IA

### Étape 1: Nouveau colis

1. Page **Colis & Courriers**
2. Onglet **Colis**
3. Cliquez sur **"Nouveau colis"**

### Étape 2: Scanner l'étiquette

1. Cliquez sur **"Scanner étiquette"**
2. Photographiez ou téléchargez l'étiquette du colis
3. L'IA extrait automatiquement:
   - 📋 Numéro de suivi
   - 📊 Code-barres
   - 👤 Expéditeur (nom, organisation, adresse)
   - 📍 Destinataire (nom, service, bureau)
   - ⚖️ Poids et dimensions
   - 📝 Instructions spéciales

### Étape 3: Classification automatique

Le système détermine:

- **Catégorie**: Standard, Fragile, Valeur, Confidentiel, Médical
- **Priorité**: Normal, Urgent, Immédiat
- **Emplacement**: Attribution automatique selon catégorie

**Emplacements:**

```
Fragile      → Zone A - Étagère sécurisée
Valeur       → Coffre-fort
Confidentiel → Armoire verrouillée
Médical      → Zone réfrigérée
Standard     → Zone B - Étagère standard
```

### Étape 4: Validation et enregistrement

1. Vérifiez les données extraites
2. Complétez si nécessaire
3. Cliquez sur **"Enregistrer colis"**

### Étape 5: Suivi automatique

✅ Notification email/SMS au destinataire  
✅ Statut: Réception → Stockage → Livré  
✅ Rappels automatiques si non retiré  
✅ Signature requise pour colis précieux

---

## 📧 ENREGISTRER UN COURRIER AVEC IA

### Étape 1: Nouveau courrier

1. Page **Colis & Courriers**
2. Onglet **Courriers**
3. Cliquez sur **"Nouveau courrier"**

### Étape 2: Numérisation OCR

1. Cliquez sur **"Scanner courrier"**
2. Numérisez le document
3. L'IA effectue:
   - 📖 OCR complet du texte
   - 🤖 Génération d'un résumé
   - 🏷️ Extraction de mots-clés
   - 📊 Classification automatique
   - 🔒 Détection de confidentialité
   - ⚡ Évaluation de l'urgence

### Étape 3: Informations extraites

**Affichage automatique:**

- Résumé en 2-3 phrases
- 5 mots-clés principaux
- Catégorie suggérée
- Expéditeur et destinataire
- Type de document

**Exemple d'extraction:**

```
📄 Lettre administrative
📝 Résumé: Communication officielle concernant...
🏷️ Mots-clés: fiscal, procédure, conformité...
⚡ Urgence: Urgent
🔒 Confidentialité: Normal
```

### Étape 4: Configuration distribution

**Méthodes disponibles:**

1. **Email uniquement** - Scan envoyé par email
2. **Physique uniquement** - Original remis en main propre
3. **Les deux** - Scan + original

**Règle automatique:**

- Si CONFIDENTIEL → Physique uniquement (obligatoire)
- Si NORMAL → Email par défaut
- Si URGENT → Notification immédiate

### Étape 5: Options avancées

**Réponse requise:**

- Activez si le courrier nécessite une réponse
- Définissez une date limite
- Suivi automatique de la réponse

**Archivage:**

- Automatique pour contrats et factures
- Période de rétention selon type:
  - Contrat: 10 ans
  - Facture: 5 ans
  - Administratif: 5 ans
  - Document: 3 ans
  - Lettre: 1 an

### Étape 6: Validation

1. Vérifiez les informations
2. Cliquez sur **"Enregistrer courrier"**

### Résultat

✅ Référence générée (ex: CR-2025-0123)  
✅ Document scanné et archivé  
✅ Email envoyé si non confidentiel  
✅ Suivi de lecture activé  
✅ Rappel si réponse requise

---

## 🎨 Comprendre les Badges

### Badges IA

| Badge                    | Signification                     |
| ------------------------ | --------------------------------- |
| <Badge>✨ IA 95%</Badge> | Extraction IA avec confiance 95%  |
| <Badge>✨ IA 82%</Badge> | Vérification manuelle recommandée |

### Badges Urgence

| Badge                         | Signification            |
| ----------------------------- | ------------------------ |
| <Badge>⚠️ Urgent</Badge>      | Traitement prioritaire   |
| <Badge>⚠️ Très Urgent</Badge> | Action immédiate requise |
| <Badge>⭐ VIP</Badge>         | Visiteur important       |

### Badges Sécurité

| Badge                               | Signification         |
| ----------------------------------- | --------------------- |
| <Badge>🔒 Confidentiel</Badge>      | Accès restreint       |
| <Badge>🔒 Très Confidentiel</Badge> | Top secret            |
| <Badge>💎 Valeur</Badge>            | Colis précieux        |
| <Badge>⚠️ Fragile</Badge>           | Manipulation délicate |

---

## 📊 Tableau de Bord Réception

### Accès rapide aux KPIs

- **Visiteurs Présents**: Nombre actuel de visiteurs sur site
- **Opérations IA Aujourd'hui**: Total d'extractions effectuées
- **Colis en Attente**: Colis non retirés
- **Courriers Non Lus**: Courriers à traiter

### Alertes Automatiques

🚨 **Attention requise si:**

- Visiteurs en retard (dépassement durée prévue)
- Colis urgents non livrés
- Courriers urgents non traités
- Vérification IA requise (confiance < 85%)

---

## 💡 Conseils et Bonnes Pratiques

### Pour un Scan Optimal

**Photos de Pièces d'Identité:**

- ✅ Éclairage uniforme
- ✅ Document à plat
- ✅ Tous les bords visibles
- ✅ Pas de reflets
- ✅ Texte net et lisible
- ❌ Éviter les ombres
- ❌ Éviter le flou
- ❌ Éviter l'inclinaison

**Photos d'Étiquettes Colis:**

- ✅ Code-barres entièrement visible
- ✅ Numéro de suivi lisible
- ✅ Adresses complètes visibles
- ✅ Bonne résolution
- ❌ Éviter le pli sur code-barres
- ❌ Éviter la lumière directe

**Scan de Courriers:**

- ✅ Première page complète
- ✅ En-tête et pied de page visibles
- ✅ Texte noir sur fond blanc
- ✅ Haute résolution
- ❌ Éviter les écritures manuscrites illisibles

### Vérification des Données Extraites

**Toujours vérifier:**

1. Nom et prénom (orthographe)
2. Numéros (identité, tracking)
3. Dates (format et validité)
4. Adresses (complétude)

**Si confiance < 90%:**

- Double-vérification obligatoire
- Correction manuelle si nécessaire
- Signaler les erreurs récurrentes

### Gestion des Courriers Confidentiels

**Règles à respecter:**

1. ❌ Ne JAMAIS envoyer par email
2. ✅ Livraison physique uniquement
3. ✅ Notifier par téléphone
4. ✅ Signature obligatoire
5. ✅ Archivage sécurisé

### Workflow Recommandé

**Matin (8h-10h):**

1. Vérifier les visiteurs attendus
2. Traiter les courriers urgents reçus
3. Livrer les colis du jour
4. Vérifier les alertes

**Journée (10h-17h):**

1. Enregistrer visiteurs arrivants
2. Scanner nouveaux colis
3. Numériser courriers entrants
4. Gérer les sorties visiteurs

**Fin de journée (17h-18h):**

1. Check-out visiteurs restants
2. Rapport quotidien
3. Rangement colis
4. Archivage courriers

---

## 🆘 Résolution de Problèmes

### Erreur "Échec de l'extraction"

**Causes possibles:**

- Photo floue ou mal cadrée
- Document endommagé
- Mauvais éclairage
- Format non supporté

**Solutions:**

1. Reprendre la photo avec meilleur éclairage
2. Nettoyer l'objectif de la caméra
3. Utiliser un scanner si disponible
4. Saisir manuellement en dernier recours

### Badge "Vérification requise"

**Que faire:**

1. Examiner les warnings affichés
2. Vérifier chaque champ extrait
3. Corriger les erreurs détectées
4. Valider après vérification

**Warnings courants:**

- "Document expire bientôt" → Vérifier date validité
- "Document peu net" → Vérifier lisibilité
- "Champs manquants" → Compléter manuellement

### Notification non envoyée

**Vérifier:**

1. Email destinataire renseigné
2. Connexion internet active
3. Paramètres email configurés
4. Courrier non marqué "confidentiel"

---

## 📞 Support

**Assistance technique:**

- Extension: 2200 (Reception)
- Email: reception@sogara.com
- Heures: Lundi-Vendredi 7h-19h

**Urgences:**

- Sécurité: Extension 3000
- IT Support: Extension 2100

---

## ✨ Nouveautés et Avantages

### Avant vs Après

**AVANT (Saisie manuelle):**

- ⏱️ 5 minutes par visiteur
- ❌ 15% d'erreurs de saisie
- 📝 Ressaisie fréquente
- 😓 Fatigue opérateur

**APRÈS (IA automatique):**

- ⚡ 30 secondes par visiteur
- ✅ 2% d'erreurs seulement
- 🤖 Pré-remplissage auto
- 😊 Confort amélioré

### Gains Mesurables

**Temps:**

- 90% plus rapide
- 4,5 minutes économisées par visiteur
- ~2 heures par jour pour 25 visiteurs

**Qualité:**

- 87% moins d'erreurs
- Données normalisées
- Traçabilité complète

**Satisfaction:**

- Visiteurs: Attente réduite
- Employés: Moins de paperasse
- Direction: Meilleure gestion

---

## 🎓 Formation Rapide

### Module 1: Visiteurs (10 min)

1. Démo scan pièce d'identité
2. Vérification données extraites
3. Génération badge QR
4. Enregistrement sortie

### Module 2: Colis (10 min)

1. Scan étiquette colis
2. Classification automatique
3. Attribution emplacement
4. Processus de livraison

### Module 3: Courriers (10 min)

1. Numérisation OCR
2. Résumé automatique
3. Distribution intelligente
4. Archivage

---

## 📋 Checklist Quotidienne

### Début de journée ☀️

- [ ] Vérifier visiteurs attendus
- [ ] Consulter alertes système
- [ ] Préparer badges visiteurs VIP
- [ ] Vérifier emplacement colis disponibles

### Pendant la journée 💼

- [ ] Scanner chaque visiteur arrivant
- [ ] Photographier chaque colis reçu
- [ ] Numériser courriers importants
- [ ] Notifier destinataires

### Fin de journée 🌙

- [ ] Check-out visiteurs restants
- [ ] Ranger colis non retirés
- [ ] Archiver courriers traités
- [ ] Générer rapport quotidien

---

**Version**: 1.0.0  
**Dernière mise à jour**: Octobre 2025  
**Contact**: reception@sogara.com

✨ **Le futur de la gestion de réception est là !**
