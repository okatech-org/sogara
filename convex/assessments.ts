import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE Assessment
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    category: v.string(),
    duration: v.number(),
    passingScore: v.number(),
    totalPoints: v.number(),
    questions: v.any(),
    instructions: v.optional(v.string()),
    validityMonths: v.optional(v.number()),
    createdBy: v.id("employees"),
    grantsHabilitation: v.optional(v.string()),
    habilitationCode: v.optional(v.string()),
    habilitationDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assessmentId = await ctx.db.insert("assessments", {
      ...args,
      isPublished: false,
    });

    return assessmentId;
  },
});

// PUBLISH Assessment
export const publish = mutation({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isPublished: true,
    });
  },
});

// ASSIGN to Candidate
export const assign = mutation({
  args: {
    assessmentId: v.id("assessments"),
    candidateId: v.string(),
    candidateType: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("assessmentSubmissions", {
      assessmentId: args.assessmentId,
      candidateId: args.candidateId,
      candidateType: args.candidateType,
      status: 'assigned',
      answers: [],
      assignedAt: Date.now(),
    });

    return submissionId;
  },
});

// START Assessment (by candidate)
export const start = mutation({
  args: { submissionId: v.id("assessmentSubmissions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: 'in_progress',
      startedAt: Date.now(),
    });
  },
});

// SUBMIT Answers
export const submit = mutation({
  args: {
    submissionId: v.id("assessmentSubmissions"),
    answers: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      answers: args.answers,
      status: 'submitted',
      submittedAt: Date.now(),
    });
  },
});

// CORRECT Assessment (by HSE)
export const correct = mutation({
  args: {
    submissionId: v.id("assessmentSubmissions"),
    questionGrades: v.any(),
    score: v.number(),
    totalPoints: v.number(),
    earnedPoints: v.number(),
    isPassed: v.boolean(),
    correctorComments: v.optional(v.string()),
    correctorId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { submissionId, correctorId, ...data } = args;
    
    await ctx.db.patch(submissionId, {
      ...data,
      status: args.isPassed ? 'passed' : 'failed',
      correctedAt: Date.now(),
      correctorId,
    });

    // Si réussi, générer certificat ET accorder habilitation
    if (args.isPassed) {
      const submission = await ctx.db.get(submissionId);
      if (submission) {
        const assessment = await ctx.db.get(submission.assessmentId);
        
        const certificateUrl = `certificate_${submissionId}_${Date.now()}.pdf`;
        const expiryDate = assessment?.validityMonths 
          ? Date.now() + (assessment.validityMonths * 30 * 24 * 60 * 60 * 1000)
          : undefined;
        
        await ctx.db.patch(submissionId, {
          certificateUrl,
          certificateIssuedAt: Date.now(),
          expiryDate,
        });

        // Si test accorde une habilitation ET candidat est un employé
        if (assessment?.grantsHabilitation && submission.candidateType === 'employee') {
          try {
            // Récupérer l'employé
            const employee = await ctx.db.get(submission.candidateId as any);
            
            if (employee) {
              // Vérifier si l'habilitation existe déjà
              const currentHabilitations = employee.habilitations || [];
              
              if (!currentHabilitations.includes(assessment.grantsHabilitation)) {
                // Ajouter la nouvelle habilitation
                await ctx.db.patch(submission.candidateId as any, {
                  habilitations: [...currentHabilitations, assessment.grantsHabilitation],
                });
              }
            }
          } catch (error) {
            console.error('Erreur ajout habilitation:', error);
          }
        }
      }
    }
  },
});

// LIST Assessments
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("assessments").collect();
  },
});

// GET by ID
export const getById = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// LIST Submissions (for HSE to correct)
export const listSubmissions = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let submissions = await ctx.db.query("assessmentSubmissions").collect();
    
    if (args.status) {
      submissions = submissions.filter(s => s.status === args.status);
    }
    
    return submissions;
  },
});

// GET My Submissions (for candidate)
export const getMySubmissions = query({
  args: { candidateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessmentSubmissions")
      .filter((q) => q.eq(q.field("candidateId"), args.candidateId))
      .collect();
  },
});

