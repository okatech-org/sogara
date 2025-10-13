# Corrections TypeScript Urgentes

## Statut : En cours de correction

### Erreurs critiques identifiées

1. **useAuth() retourne `currentUser` pas `user`**
   - ✅ Corrigé dans HSEEmployeeManager.tsx
   - ✅ Corrigé dans HSENotificationCenter.tsx  
   - ⚠️ Reste d'autres fichiers à corriger

2. **Employee.photo ajouté au type**
   - ✅ Corrigé dans src/types/index.ts ligne 31

3. **HSENotification metadata manque 'sentBy'**
   - ❌ À corriger dans src/types/index.ts

4. **CreateEmployeeDialog manque stats et equipmentIds**
   - ❌ À corriger

5. **Equipment utilise 'label' pas 'name'**
   - ❌ HSEEquipmentManagement.tsx utilise incorrectement 'name'

6. **Badge variants incorrects**  
   - 'destructive' utilisé là où seuls 'info', 'maintenance', 'operational', 'success', 'urgent', 'warning' sont acceptés

7. **Button variants incorrects**
   - 'success' utilisé là où seuls 'default', 'destructive', 'outline', 'secondary' sont acceptés

### Recommandation

Étant donné le nombre élevé d'erreurs (50+), il serait préférable de:

1. **Option A**: Revenir à une version stable antérieure
2. **Option B**: Corriger méthodiquement les erreurs par catégorie
3. **Option C**: Désactiver temporairement les fichiers problématiques

### Erreurs par fichier

- CreateEmployeeDialog.tsx: 1 erreur (stats, equipmentIds manquants)
- EmployeeForm.tsx: 4 erreurs (roles COMPLIANCE)
- HSEEquipmentManagement.tsx: 8 erreurs (name vs label, méthodes repository)
- HSENotificationCenter.tsx: 6 erreurs (user vs currentUser, sentBy)
- HSEDashboard.tsx: 6 erreurs (HSETrainingModule vs HSETraining)
- Et plus...

### Priorité immédiate

Les erreurs bloquent la compilation. Focus sur:
1. Corriger les références `user` → `currentUser` partout
2. Ajouter `sentBy` à HSENotification metadata
3. Fix Equipment name → label
4. Ajouter defaults pour stats et equipmentIds

## Notes pour l'admin

Ce fichier documente l'état actuel des erreurs TypeScript pour faciliter le débogage.
Les comptes démo ne sont pas impactés par les problèmes de sécurité RLS identifiés précédemment.
