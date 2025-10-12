# 🚀 IMPLÉMENTATION CONVEX - SOGARA

## ✅ SPRINT 1.1 : Configuration Convex - TERMINÉ

### Ce qui a été fait :
1. ✅ Package `convex` version 1.27.4 déjà installé
2. ✅ Fichier `convex.json` créé
3. ✅ Dossier `convex/` créé
4. ✅ Fichier `convex/schema.ts` créé avec **8 tables complètes** :
   - `employees` (avec index: matricule, status, service)
   - `visits` (avec index: status, host, visitor, scheduled)
   - `visitors` (avec index: idDocument, company)
   - `packages` (avec index: status, recipient, service, reference, priority)
   - `equipment` (avec index: status, holder, type, serial)
   - `hseIncidents` (avec index: status, severity, employee, date)
   - `hseTrainings` (avec index: code, category)
   - `trainingProgress` (avec index: employee, training, status)
   - `posts` (avec index: author, category, status, published)
5. ✅ Provider React déjà configuré dans `src/main.tsx`
6. ✅ Client Convex déjà configuré dans `src/lib/convexClient.ts`

---

## 🔄 SPRINT 1.2 : Génération des types - EN COURS

### Prochaine étape :
```bash
# Arrêter le processus convex dev en cours si nécessaire
# Puis relancer :
npx convex dev
```

**Cette commande va :**
- Créer un projet Convex sur le cloud
- Générer les types TypeScript dans `convex/_generated/`
- Donner une URL de production (format: `https://[project].convex.cloud`)
- Mettre à jour `.env` avec `VITE_CONVEX_URL`

### Critères de validation :
- [ ] Dossier `convex/_generated/` créé
- [ ] Fichier `convex/_generated/api.d.ts` existe
- [ ] URL Convex visible dans le terminal
- [ ] Application démarre sans erreur TypeScript

---

## 📋 SPRINT 2 : Mutations & Queries - À FAIRE

### Fichiers à créer :
1. `convex/employees.ts` - CRUD complet
2. `convex/visits.ts` - CRUD + queries par status/host
3. `convex/visitors.ts` - CRUD + search
4. `convex/packages.ts` - CRUD + queries par status/recipient
5. `convex/equipment.ts` - CRUD + queries par status/assignee
6. `convex/hseIncidents.ts` - CRUD + queries par severity
7. `convex/hseTrainings.ts` - CRUD + participation
8. `convex/posts.ts` - CRUD + queries par category/status

### Pattern à suivre pour chaque fichier :
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE
export const create = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // Validation
    // Insert
    return id;
  },
});

// LIST
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tableName").collect();
  },
});

// UPDATE
export const update = mutation({
  args: { id: v.id("tableName"), /* ... */ },
  handler: async (ctx, args) => {
    // Update
  },
});

// DELETE
export const remove = mutation({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

---

## 📊 SPRINT 3 : Seed Data & Auth - À FAIRE

### 1. convex/seed.ts
**Créer les 6 comptes démos :**
- ADM001 (Pellen ASTED - ADMIN)
- HSE001 (Marie-Claire NZIEGE - HSE + COMPLIANCE)
- REC001 (Sylvie KOUMBA - RECEP)
- COM001 (Clarisse MBOUMBA - COMMUNICATION)
- EMP001 (Pierre BEKALE - EMPLOYE)
- SUP001 (Christian ELLA - SUPERVISEUR)

**Créer données de test :**
- 5-10 visiteurs et visites
- 5-10 colis/courriers
- 10-15 équipements
- 3-5 incidents HSE
- 15 formations HSE (charger depuis JSON existant)
- 4-5 posts SOGARA Connect

### 2. convex/auth.ts
```typescript
export const login = query({
  args: { matricule: v.string() },
  handler: async (ctx, args) => {
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_matricule", (q) => q.eq("matricule", args.matricule))
      .first();
    
    if (!employee || employee.status !== "active") {
      return null;
    }
    
    return employee;
  },
});

export const checkPermission = query({
  args: { 
    employeeId: v.id("employees"),
    requiredRoles: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) return false;
    
    return args.requiredRoles.some(role => 
      employee.roles.includes(role)
    );
  },
});
```

---

## 🔌 SPRINT 4 : Intégration Frontend - À FAIRE

### Refactoriser les hooks :

#### Exemple : useEmployees.ts
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useEmployees = () => {
  const employees = useQuery(api.employees.list) ?? [];
  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const deleteEmployee = useMutation(api.employees.remove);
  
  return {
    employees,
    addEmployee: async (data) => {
      try {
        await createEmployee(data);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    // ... autres fonctions
  };
};
```

### Hooks à refactoriser :
- [ ] `src/hooks/useEmployees.ts`
- [ ] `src/hooks/useVisits.ts`
- [ ] `src/hooks/usePackages.ts`
- [ ] `src/hooks/useEquipment.ts`
- [ ] `src/hooks/useHSEIncidents.ts`
- [ ] `src/hooks/useHSETrainings.ts`
- [ ] `src/hooks/usePosts.ts`

### Refactoriser AuthContext :
```typescript
// Dans src/contexts/AppContext.tsx
const [matricule, setMatricule] = useState<string | null>(null);
const employee = useQuery(
  api.auth.login,
  matricule ? { matricule } : "skip"
);

const login = async (mat: string) => {
  setMatricule(mat);
  // Le reste est géré par useQuery automatiquement
};
```

---

## 🎯 SPRINT 5 : Finalisation - À FAIRE

### 1. File Storage (convex/storage.ts)
```typescript
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveFileReference = mutation({
  args: { storageId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    // Sauvegarder la référence
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

### 2. Tests de bout en bout
- [ ] Authentification (login/logout)
- [ ] Module Personnel (CRUD)
- [ ] Module Visites (workflow complet)
- [ ] Module Colis (traçabilité)
- [ ] Module Équipements
- [ ] Module HSE (incidents + formations)
- [ ] SOGARA Connect (posts + images)
- [ ] Dashboard (KPIs temps réel)

### 3. Déploiement
```bash
# Backend
npx convex deploy
npx convex run seed:seedDemoData --prod

# Frontend (Vercel)
vercel --prod
```

---

## 📊 AVANCEMENT GLOBAL

| Sprint | Tâches | État | %  |
|--------|--------|------|-----|
| Sprint 1 | Configuration + Schéma | ✅ | 100% |
| Sprint 2 | Mutations & Queries | ⏳ | 0% |
| Sprint 3 | Seed + Auth | ⏳ | 0% |
| Sprint 4 | Intégration Frontend | ⏳ | 0% |
| Sprint 5 | Tests + Déploiement | ⏳ | 0% |

**TOTAL : 20% ✅**

---

## 🎯 PROCHAINE ACTION IMMÉDIATE

**MAINTENANT** :
```bash
cd /Users/okatech/SOGARA/sogara
npx convex dev
```

**Attendre que :**
1. Le projet Convex soit créé
2. Les types soient générés
3. L'URL soit affichée
4. Le dashboard s'ouvre automatiquement

**Puis passer au Sprint 2 !** 🚀

---

_Dernière mise à jour : 9 Octobre 2025_

