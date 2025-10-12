import { v } from "convex/values";
import { query } from "./_generated/server";

// LOGIN - Authentification par matricule
export const login = query({
  args: { matricule: v.string() },
  handler: async (ctx, args) => {
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_matricule", (q) => q.eq("matricule", args.matricule))
      .first();

    // Vérifier que l'employé existe et est actif
    if (!employee || employee.status !== "active") {
      return null;
    }

    return employee;
  },
});

// CHECK PERMISSION - Vérifier si un employé a les permissions requises
export const checkPermission = query({
  args: {
    employeeId: v.id("employees"),
    requiredRoles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    
    if (!employee || employee.status !== "active") {
      return false;
    }

    // Vérifier si l'employé a au moins un des rôles requis
    const hasPermission = args.requiredRoles.some((role) =>
      employee.roles.includes(role)
    );

    return hasPermission;
  },
});

// HAS ANY ROLE - Vérifier si un employé a l'un des rôles
export const hasAnyRole = query({
  args: {
    employeeId: v.id("employees"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    
    if (!employee) {
      return false;
    }

    return args.roles.some((role) => employee.roles.includes(role));
  },
});

// HAS ALL ROLES - Vérifier si un employé a tous les rôles
export const hasAllRoles = query({
  args: {
    employeeId: v.id("employees"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    
    if (!employee) {
      return false;
    }

    return args.roles.every((role) => employee.roles.includes(role));
  },
});

// GET CURRENT USER INFO - Récupérer infos utilisateur connecté
export const getCurrentUser = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.employeeId);
  },
});

