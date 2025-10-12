import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE HSE Incident
export const create = mutation({
  args: {
    employeeId: v.id("employees"),
    type: v.string(),
    severity: v.string(), // "low" | "medium" | "high"
    description: v.string(),
    location: v.string(),
    occurredAt: v.number(),
    reportedBy: v.id("employees"),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const incidentId = await ctx.db.insert("hseIncidents", {
      employeeId: args.employeeId,
      type: args.type,
      severity: args.severity,
      description: args.description,
      location: args.location,
      occurredAt: args.occurredAt,
      status: "reported",
      reportedBy: args.reportedBy,
      attachments: args.attachments,
    });

    return incidentId;
  },
});

// LIST all incidents
export const list = query({
  args: {},
  handler: async (ctx) => {
    const incidents = await ctx.db
      .query("hseIncidents")
      .order("desc")
      .collect();

    // Enrichir avec les données des employés
    const enrichedIncidents = await Promise.all(
      incidents.map(async (incident) => {
        const employee = await ctx.db.get(incident.employeeId);
        const reporter = await ctx.db.get(incident.reportedBy);
        const investigator = incident.investigatedBy
          ? await ctx.db.get(incident.investigatedBy)
          : null;

        return {
          ...incident,
          employee,
          reporter,
          investigator,
        };
      })
    );

    return enrichedIncidents;
  },
});

// LIST incidents by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const incidents = await ctx.db
      .query("hseIncidents")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    const enrichedIncidents = await Promise.all(
      incidents.map(async (incident) => {
        const employee = await ctx.db.get(incident.employeeId);
        const reporter = await ctx.db.get(incident.reportedBy);
        return {
          ...incident,
          employee,
          reporter,
        };
      })
    );

    return enrichedIncidents;
  },
});

// LIST incidents by severity
export const listBySeverity = query({
  args: { severity: v.string() },
  handler: async (ctx, args) => {
    const incidents = await ctx.db
      .query("hseIncidents")
      .withIndex("by_severity", (q) => q.eq("severity", args.severity))
      .order("desc")
      .collect();

    const enrichedIncidents = await Promise.all(
      incidents.map(async (incident) => {
        const employee = await ctx.db.get(incident.employeeId);
        return {
          ...incident,
          employee,
        };
      })
    );

    return enrichedIncidents;
  },
});

// GET incident by ID
export const getById = query({
  args: { id: v.id("hseIncidents") },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.id);
    if (!incident) return null;

    const employee = await ctx.db.get(incident.employeeId);
    const reporter = await ctx.db.get(incident.reportedBy);
    const investigator = incident.investigatedBy
      ? await ctx.db.get(incident.investigatedBy)
      : null;

    return {
      ...incident,
      employee,
      reporter,
      investigator,
    };
  },
});

// UPDATE incident
export const update = mutation({
  args: {
    id: v.id("hseIncidents"),
    status: v.optional(v.string()),
    investigatedBy: v.optional(v.id("employees")),
    correctiveActions: v.optional(v.string()),
    rootCause: v.optional(v.string()),
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

// ASSIGN investigator
export const assignInvestigator = mutation({
  args: {
    incidentId: v.id("hseIncidents"),
    investigatorId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      investigatedBy: args.investigatorId,
      status: "investigating",
    });
  },
});

// RESOLVE incident
export const resolve = mutation({
  args: {
    incidentId: v.id("hseIncidents"),
    correctiveActions: v.string(),
    rootCause: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      status: "resolved",
      correctiveActions: args.correctiveActions,
      rootCause: args.rootCause,
    });
  },
});

// DELETE incident
export const remove = mutation({
  args: { id: v.id("hseIncidents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// GET statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allIncidents = await ctx.db.query("hseIncidents").collect();
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      open: allIncidents.filter((i) => i.status !== "resolved").length,
      highSeverity: allIncidents.filter(
        (i) => i.severity === "high" && i.status !== "resolved"
      ).length,
      thisMonth: allIncidents.filter((i) => i.occurredAt >= monthAgo).length,
    };
  },
});

