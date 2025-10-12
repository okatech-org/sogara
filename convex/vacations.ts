import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE Vacation
export const create = mutation({
  args: {
    date: v.number(),
    type: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    employeeId: v.id("employees"),
    siteId: v.string(),
    siteName: v.string(),
    plannedHours: v.number(),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vacationId = await ctx.db.insert("vacations", {
      date: args.date,
      type: args.type,
      startTime: args.startTime,
      endTime: args.endTime,
      employeeId: args.employeeId,
      siteId: args.siteId,
      siteName: args.siteName,
      plannedHours: args.plannedHours,
      status: args.status || 'PLANNED',
      isValidated: false,
      notes: args.notes,
    });

    return vacationId;
  },
});

// LIST Vacations
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vacations").collect();
  },
});

// LIST by Employee
export const listByEmployee = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vacations")
      .filter((q) => q.eq(q.field("employeeId"), args.employeeId))
      .collect();
  },
});

// LIST by Month
export const listByMonth = query({
  args: { 
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const allVacations = await ctx.db.query("vacations").collect();
    
    return allVacations.filter(v => {
      const date = new Date(v.date);
      return date.getMonth() + 1 === args.month && date.getFullYear() === args.year;
    });
  },
});

// CHECK IN
export const checkIn = mutation({
  args: { id: v.id("vacations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      checkInTime: Date.now(),
      status: 'IN_PROGRESS',
    });
  },
});

// CHECK OUT
export const checkOut = mutation({
  args: { 
    id: v.id("vacations"),
    actualHours: v.number(),
    overtimeHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      checkOutTime: Date.now(),
      actualHours: args.actualHours,
      overtimeHours: args.overtimeHours || 0,
      status: 'COMPLETED',
    });
  },
});

// UPDATE
export const update = mutation({
  args: {
    id: v.id("vacations"),
    status: v.optional(v.string()),
    actualHours: v.optional(v.number()),
    overtimeHours: v.optional(v.number()),
    nightHours: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// DELETE
export const remove = mutation({
  args: { id: v.id("vacations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

