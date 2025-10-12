import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE HSE Training
export const create = mutation({
  args: {
    code: v.string(),
    title: v.string(),
    category: v.string(),
    description: v.string(),
    objectives: v.array(v.string()),
    duration: v.number(),
    durationUnit: v.string(),
    validityMonths: v.number(),
    requiredForRoles: v.array(v.string()),
    prerequisites: v.array(v.string()),
    content: v.any(),
    certification: v.object({
      examRequired: v.boolean(),
      passingScore: v.optional(v.number()),
      practicalTest: v.boolean(),
      certificateType: v.string(),
    }),
    maxParticipants: v.number(),
    language: v.array(v.string()),
    deliveryMethods: v.array(v.string()),
    refresherRequired: v.boolean(),
    refresherFrequency: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Vérifier unicité du code
    const existing = await ctx.db
      .query("hseTrainings")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) {
      throw new Error(`La formation avec le code ${args.code} existe déjà`);
    }

    const trainingId = await ctx.db.insert("hseTrainings", {
      code: args.code,
      title: args.title,
      category: args.category,
      description: args.description,
      objectives: args.objectives,
      duration: args.duration,
      durationUnit: args.durationUnit,
      validityMonths: args.validityMonths,
      requiredForRoles: args.requiredForRoles,
      prerequisites: args.prerequisites,
      content: args.content,
      certification: args.certification,
      maxParticipants: args.maxParticipants,
      language: args.language,
      deliveryMethods: args.deliveryMethods,
      refresherRequired: args.refresherRequired,
      refresherFrequency: args.refresherFrequency,
    });

    return trainingId;
  },
});

// LIST all trainings
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("hseTrainings").collect();
  },
});

// LIST trainings by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hseTrainings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// GET training by ID
export const getById = query({
  args: { id: v.id("hseTrainings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// GET training by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hseTrainings")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// UPDATE training
export const update = mutation({
  args: {
    id: v.id("hseTrainings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    duration: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
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

// DELETE training
export const remove = mutation({
  args: { id: v.id("hseTrainings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// START training for employee
export const startTraining = mutation({
  args: {
    employeeId: v.id("employees"),
    trainingId: v.id("hseTrainings"),
  },
  handler: async (ctx, args) => {
    // Vérifier si la progression existe déjà
    const existing = await ctx.db
      .query("trainingProgress")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const alreadyStarted = existing.find(
      (p) => p.trainingId === args.trainingId
    );

    if (alreadyStarted) {
      return alreadyStarted._id;
    }

    // Créer une nouvelle progression
    const progressId = await ctx.db.insert("trainingProgress", {
      employeeId: args.employeeId,
      trainingId: args.trainingId,
      status: "in_progress",
      completedModules: [],
      startedAt: Date.now(),
    });

    return progressId;
  },
});

// COMPLETE training
export const completeTraining = mutation({
  args: {
    progressId: v.id("trainingProgress"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId);
    if (!progress) {
      throw new Error("Progression non trouvée");
    }

    const training = await ctx.db.get(progress.trainingId);
    if (!training) {
      throw new Error("Formation non trouvée");
    }

    const expiresAt = Date.now() + training.validityMonths * 30 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.progressId, {
      status: "completed",
      completedAt: Date.now(),
      certificateIssuedAt: Date.now(),
      expiresAt,
      score: args.score,
    });

    // Mettre à jour les stats de l'employé
    const employee = await ctx.db.get(progress.employeeId);
    if (employee) {
      await ctx.db.patch(progress.employeeId, {
        stats: {
          ...employee.stats,
          hseTrainingsCompleted: employee.stats.hseTrainingsCompleted + 1,
        },
      });
    }
  },
});

// GET employee progress
export const getEmployeeProgress = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const progressList = await ctx.db
      .query("trainingProgress")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    // Enrichir avec les données des formations
    const enrichedProgress = await Promise.all(
      progressList.map(async (progress) => {
        const training = await ctx.db.get(progress.trainingId);
        return {
          ...progress,
          training,
        };
      })
    );

    return enrichedProgress;
  },
});

// GET statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allProgress = await ctx.db.query("trainingProgress").collect();
    const now = Date.now();

    return {
      inProgress: allProgress.filter((p) => p.status === "in_progress").length,
      completed: allProgress.filter((p) => p.status === "completed").length,
      expired: allProgress.filter((p) => p.expiresAt && p.expiresAt < now).length,
    };
  },
});

