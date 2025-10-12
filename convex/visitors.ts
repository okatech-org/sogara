import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE Visitor
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    company: v.string(),
    idDocument: v.string(),
    documentType: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    photo: v.optional(v.string()),
    nationality: v.optional(v.string()),
    birthDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si le visiteur existe déjà (par ID document)
    const existing = await ctx.db
      .query("visitors")
      .withIndex("by_idDocument", (q) => q.eq("idDocument", args.idDocument))
      .first();

    if (existing) {
      return existing._id; // Retourner l'ID existant
    }

    // Créer le nouveau visiteur
    const visitorId = await ctx.db.insert("visitors", {
      firstName: args.firstName,
      lastName: args.lastName,
      company: args.company,
      idDocument: args.idDocument,
      documentType: args.documentType,
      phone: args.phone,
      email: args.email,
      photo: args.photo,
      nationality: args.nationality,
      birthDate: args.birthDate,
    });

    return visitorId;
  },
});

// LIST all visitors
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("visitors").collect();
  },
});

// GET visitor by ID
export const getById = query({
  args: { id: v.id("visitors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// GET visitor by ID document
export const getByIdDocument = query({
  args: { idDocument: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visitors")
      .withIndex("by_idDocument", (q) => q.eq("idDocument", args.idDocument))
      .first();
  },
});

// SEARCH visitors by name
export const searchByName = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allVisitors = await ctx.db.query("visitors").collect();
    const searchLower = args.searchTerm.toLowerCase();

    return allVisitors.filter(
      (v) =>
        v.firstName.toLowerCase().includes(searchLower) ||
        v.lastName.toLowerCase().includes(searchLower)
    );
  },
});

// LIST visitors by company
export const listByCompany = query({
  args: { company: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visitors")
      .withIndex("by_company", (q) => q.eq("company", args.company))
      .collect();
  },
});

// UPDATE visitor
export const update = mutation({
  args: {
    id: v.id("visitors"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    photo: v.optional(v.string()),
    nationality: v.optional(v.string()),
    birthDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const updateData: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    await ctx.db.patch(id, updateData);
  },
});

// DELETE visitor
export const remove = mutation({
  args: { id: v.id("visitors") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

