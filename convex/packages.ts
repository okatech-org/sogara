import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE Package/Mail
export const create = mutation({
  args: {
    type: v.string(), // "package" | "mail"
    reference: v.string(),
    sender: v.string(),
    recipientEmployeeId: v.optional(v.id("employees")),
    recipientService: v.optional(v.string()),
    description: v.string(),
    photoUrl: v.optional(v.string()),
    isConfidential: v.boolean(),
    priority: v.string(), // "normal" | "urgent"
    location: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    weight: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const packageId = await ctx.db.insert("packages", {
      type: args.type,
      reference: args.reference,
      sender: args.sender,
      recipientEmployeeId: args.recipientEmployeeId,
      recipientService: args.recipientService,
      description: args.description,
      photoUrl: args.photoUrl,
      isConfidential: args.isConfidential,
      priority: args.priority,
      status: "received",
      receivedAt: Date.now(),
      location: args.location,
      trackingNumber: args.trackingNumber,
      weight: args.weight,
      category: args.category,
    });

    return packageId;
  },
});

// LIST all packages
export const list = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db
      .query("packages")
      .order("desc")
      .collect();

    // Enrichir avec les données du destinataire
    const enrichedPackages = await Promise.all(
      packages.map(async (pkg) => {
        const recipient = pkg.recipientEmployeeId
          ? await ctx.db.get(pkg.recipientEmployeeId)
          : null;
        return {
          ...pkg,
          recipientEmployee: recipient,
        };
      })
    );

    return enrichedPackages;
  },
});

// LIST packages by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const packages = await ctx.db
      .query("packages")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    const enrichedPackages = await Promise.all(
      packages.map(async (pkg) => {
        const recipient = pkg.recipientEmployeeId
          ? await ctx.db.get(pkg.recipientEmployeeId)
          : null;
        return {
          ...pkg,
          recipientEmployee: recipient,
        };
      })
    );

    return enrichedPackages;
  },
});

// LIST packages by recipient
export const listByRecipient = query({
  args: { recipientEmployeeId: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("packages")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientEmployeeId", args.recipientEmployeeId)
      )
      .order("desc")
      .collect();
  },
});

// LIST packages by service
export const listByService = query({
  args: { service: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("packages")
      .withIndex("by_service", (q) => q.eq("recipientService", args.service))
      .order("desc")
      .collect();
  },
});

// GET package by ID
export const getById = query({
  args: { id: v.id("packages") },
  handler: async (ctx, args) => {
    const pkg = await ctx.db.get(args.id);
    if (!pkg) return null;

    const recipient = pkg.recipientEmployeeId
      ? await ctx.db.get(pkg.recipientEmployeeId)
      : null;

    return {
      ...pkg,
      recipientEmployee: recipient,
    };
  },
});

// UPDATE package
export const update = mutation({
  args: {
    id: v.id("packages"),
    status: v.optional(v.string()),
    deliveredAt: v.optional(v.number()),
    deliveredBy: v.optional(v.string()),
    signature: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
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

// DELIVER package
export const deliver = mutation({
  args: {
    id: v.id("packages"),
    deliveredBy: v.string(),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "delivered",
      deliveredAt: Date.now(),
      deliveredBy: args.deliveredBy,
      signature: args.signature,
    });
  },
});

// DELETE package
export const remove = mutation({
  args: { id: v.id("packages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// GET statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allPackages = await ctx.db.query("packages").collect();

    return {
      pending: allPackages.filter((p) => p.status !== "delivered").length,
      urgent: allPackages.filter(
        (p) => p.priority === "urgent" && p.status !== "delivered"
      ).length,
      delivered: allPackages.filter((p) => p.status === "delivered").length,
    };
  },
});

