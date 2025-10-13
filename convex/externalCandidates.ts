import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// CREATE External Candidate
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.string(),
    position: v.string(),
    idDocument: v.string(),
    documentType: v.string(),
    purpose: v.string(),
    requestedBy: v.optional(v.id('employees')),
  },
  handler: async (ctx, args) => {
    const candidateId = await ctx.db.insert('externalCandidates', {
      ...args,
      status: 'pending',
    })

    return candidateId
  },
})

// APPROVE Candidate
export const approve = mutation({
  args: {
    id: v.id('externalCandidates'),
    approvedBy: v.id('employees'),
    validityMonths: v.number(),
  },
  handler: async (ctx, args) => {
    const validUntil = Date.now() + args.validityMonths * 30 * 24 * 60 * 60 * 1000

    await ctx.db.patch(args.id, {
      status: 'approved',
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      validUntil,
    })
  },
})

// LIST External Candidates
export const list = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('externalCandidates').collect()
  },
})

// GET by ID
export const getById = query({
  args: { id: v.id('externalCandidates') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// LIST by Status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('externalCandidates')
      .filter(q => q.eq(q.field('status'), args.status))
      .collect()
  },
})
