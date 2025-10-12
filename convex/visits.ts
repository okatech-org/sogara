import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE Visit
export const create = mutation({
  args: {
    visitorId: v.id("visitors"),
    hostEmployeeId: v.id("employees"),
    scheduledAt: v.number(),
    purpose: v.string(),
    notes: v.optional(v.string()),
    badgeNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const visitId = await ctx.db.insert("visits", {
      visitorId: args.visitorId,
      hostEmployeeId: args.hostEmployeeId,
      scheduledAt: args.scheduledAt,
      purpose: args.purpose,
      notes: args.notes,
      badgeNumber: args.badgeNumber,
      status: "expected",
    });

    return visitId;
  },
});

// LIST all visits
export const list = query({
  args: {},
  handler: async (ctx) => {
    const visits = await ctx.db
      .query("visits")
      .order("desc")
      .collect();
    
    // Enrichir avec les données du visiteur et de l'hôte
    const enrichedVisits = await Promise.all(
      visits.map(async (visit) => {
        const visitor = await ctx.db.get(visit.visitorId);
        const host = await ctx.db.get(visit.hostEmployeeId);
        return {
          ...visit,
          visitor,
          hostEmployee: host,
        };
      })
    );

    return enrichedVisits;
  },
});

// LIST visits by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    const enrichedVisits = await Promise.all(
      visits.map(async (visit) => {
        const visitor = await ctx.db.get(visit.visitorId);
        const host = await ctx.db.get(visit.hostEmployeeId);
        return {
          ...visit,
          visitor,
          hostEmployee: host,
        };
      })
    );

    return enrichedVisits;
  },
});

// LIST visits by host employee
export const listByHost = query({
  args: { hostEmployeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_host", (q) => q.eq("hostEmployeeId", args.hostEmployeeId))
      .order("desc")
      .collect();

    const enrichedVisits = await Promise.all(
      visits.map(async (visit) => {
        const visitor = await ctx.db.get(visit.visitorId);
        return {
          ...visit,
          visitor,
        };
      })
    );

    return enrichedVisits;
  },
});

// GET visit by ID
export const getById = query({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.id);
    if (!visit) return null;

    const visitor = await ctx.db.get(visit.visitorId);
    const host = await ctx.db.get(visit.hostEmployeeId);

    return {
      ...visit,
      visitor,
      hostEmployee: host,
    };
  },
});

// CHECK-IN visit
export const checkIn = mutation({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      checkedInAt: Date.now(),
      status: "in_progress",
    });
  },
});

// CHECK-OUT visit
export const checkOut = mutation({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      checkedOutAt: Date.now(),
      status: "checked_out",
    });
  },
});

// UPDATE visit
export const update = mutation({
  args: {
    id: v.id("visits"),
    scheduledAt: v.optional(v.number()),
    purpose: v.optional(v.string()),
    notes: v.optional(v.string()),
    badgeNumber: v.optional(v.string()),
    status: v.optional(v.string()),
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

// DELETE visit
export const remove = mutation({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// GET today's statistics
export const getTodayStats = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = tomorrow.getTime();

    const allVisits = await ctx.db.query("visits").collect();
    const todayVisits = allVisits.filter(
      (v) => v.scheduledAt >= todayTimestamp && v.scheduledAt < tomorrowTimestamp
    );

    return {
      total: todayVisits.length,
      waiting: todayVisits.filter((v) => v.status === "waiting").length,
      inProgress: todayVisits.filter((v) => v.status === "in_progress").length,
      completed: todayVisits.filter((v) => v.status === "checked_out").length,
    };
  },
});

