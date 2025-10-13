import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// CREATE Certification Path
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    trainingModuleId: v.string(),
    trainingTitle: v.string(),
    trainingDuration: v.number(),
    assessmentId: v.id('assessments'),
    assessmentTitle: v.string(),
    daysBeforeAssessment: v.number(),
    assessmentDuration: v.number(),
    passingScore: v.number(),
    habilitationName: v.string(),
    habilitationCode: v.string(),
    habilitationValidity: v.number(),
    createdBy: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const pathId = await ctx.db.insert('certificationPaths', {
      ...args,
      isPublished: false,
    })

    return pathId
  },
})

// PUBLISH Path
export const publish = mutation({
  args: { id: v.id('certificationPaths') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isPublished: true,
    })
  },
})

// ASSIGN Path to Candidate
export const assignToCandidate = mutation({
  args: {
    pathId: v.id('certificationPaths'),
    candidateId: v.string(),
    candidateType: v.string(),
    assignedBy: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const progressId = await ctx.db.insert('certificationPathProgress', {
      pathId: args.pathId,
      candidateId: args.candidateId,
      candidateType: args.candidateType,
      status: 'not_started',
      assignedBy: args.assignedBy,
      assignedAt: Date.now(),
    })

    return progressId
  },
})

// START Training
export const startTraining = mutation({
  args: {
    progressId: v.id('certificationPathProgress'),
    trainingAssignmentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.progressId, {
      status: 'training_in_progress',
      trainingAssignmentId: args.trainingAssignmentId,
      trainingStartedAt: Date.now(),
    })
  },
})

// COMPLETE Training
export const completeTraining = mutation({
  args: {
    progressId: v.id('certificationPathProgress'),
    trainingScore: v.number(),
    daysBeforeAssessment: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const evaluationAvailableDate = now + args.daysBeforeAssessment * 24 * 60 * 60 * 1000

    await ctx.db.patch(args.progressId, {
      status: 'training_completed',
      trainingCompletedAt: now,
      trainingScore: args.trainingScore,
      evaluationAvailableDate,
    })
  },
})

// COMPLETE Evaluation (triggers habilitation if passed)
export const completeEvaluation = mutation({
  args: {
    progressId: v.id('certificationPathProgress'),
    evaluationSubmissionId: v.string(),
    evaluationScore: v.number(),
    evaluationPassed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId)
    if (!progress) throw new Error('Progress not found')

    const path = await ctx.db.get(progress.pathId)
    if (!path) throw new Error('Path not found')

    const updateData: any = {
      evaluationSubmissionId: args.evaluationSubmissionId,
      evaluationScore: args.evaluationScore,
      evaluationPassed: args.evaluationPassed,
      evaluationCorrectedAt: Date.now(),
    }

    if (args.evaluationPassed) {
      // Générer habilitation
      const habilitationGrantedAt = Date.now()
      const habilitationExpiryDate =
        habilitationGrantedAt + path.habilitationValidity * 30 * 24 * 60 * 60 * 1000

      updateData.status = 'completed_passed'
      updateData.habilitationGrantedAt = habilitationGrantedAt
      updateData.habilitationExpiryDate = habilitationExpiryDate
      updateData.completedAt = Date.now()
      updateData.certificateUrl = `cert_path_${args.progressId}_${Date.now()}.pdf`

      // Ajouter habilitation à l'employé si candidat interne
      if (progress.candidateType === 'employee') {
        try {
          const employee = await ctx.db.get(progress.candidateId as any)
          if (employee && 'habilitations' in employee) {
            const currentHabilitations = (employee.habilitations as string[]) || []
            if (!currentHabilitations.includes(path.habilitationName)) {
              await ctx.db.patch(progress.candidateId as any, {
                habilitations: [...currentHabilitations, path.habilitationName],
              })
            }
          }
        } catch (error) {
          console.error('Erreur ajout habilitation:', error)
        }
      }
    } else {
      updateData.status = 'completed_failed'
      updateData.completedAt = Date.now()
    }

    await ctx.db.patch(args.progressId, updateData)
  },
})

// LIST Paths
export const list = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('certificationPaths').collect()
  },
})

// GET My Progress
export const getMyProgress = query({
  args: { candidateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('certificationPathProgress')
      .filter(q => q.eq(q.field('candidateId'), args.candidateId))
      .collect()
  },
})
