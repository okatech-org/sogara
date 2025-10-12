import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// GENERATE UPLOAD URL - Génère une URL pour uploader un fichier
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// GET FILE URL - Récupère l'URL d'un fichier uploadé
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// DELETE FILE - Supprime un fichier du storage
export const deleteFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

