import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// CREATE Employee
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    matricule: v.string(),
    service: v.string(),
    roles: v.array(v.string()),
    competences: v.array(v.string()),
    habilitations: v.array(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier unicité du matricule
    const existing = await ctx.db
      .query('employees')
      .withIndex('by_matricule', q => q.eq('matricule', args.matricule))
      .first()

    if (existing) {
      throw new Error(`Le matricule ${args.matricule} existe déjà`)
    }

    // Créer l'employé
    const employeeId = await ctx.db.insert('employees', {
      firstName: args.firstName,
      lastName: args.lastName,
      matricule: args.matricule,
      service: args.service,
      roles: args.roles,
      competences: args.competences || [],
      habilitations: args.habilitations || [],
      email: args.email,
      phone: args.phone,
      status: args.status || 'active',
      stats: {
        visitsReceived: 0,
        packagesReceived: 0,
        hseTrainingsCompleted: 0,
      },
      equipmentIds: [],
    })

    return employeeId
  },
})

// LIST all employees
export const list = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('employees').collect()
  },
})

// GET employee by ID
export const getById = query({
  args: { id: v.id('employees') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// GET employee by matricule
export const getByMatricule = query({
  args: { matricule: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('employees')
      .withIndex('by_matricule', q => q.eq('matricule', args.matricule))
      .first()
  },
})

// LIST employees by service
export const listByService = query({
  args: { service: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('employees')
      .withIndex('by_service', q => q.eq('service', args.service))
      .collect()
  },
})

// LIST employees by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('employees')
      .withIndex('by_status', q => q.eq('status', args.status))
      .collect()
  },
})

// UPDATE employee
export const update = mutation({
  args: {
    id: v.id('employees'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    service: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    competences: v.optional(v.array(v.string())),
    habilitations: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Ne mettre à jour que les champs fournis
    const updateData: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateData[key] = value
      }
    }

    await ctx.db.patch(id, updateData)
  },
})

// DELETE employee
export const remove = mutation({
  args: { id: v.id('employees') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// UPDATE stats
export const updateStats = mutation({
  args: {
    id: v.id('employees'),
    visitsReceived: v.optional(v.number()),
    packagesReceived: v.optional(v.number()),
    hseTrainingsCompleted: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.id)
    if (!employee) {
      throw new Error('Employé non trouvé')
    }

    const updatedStats = { ...employee.stats }
    if (args.visitsReceived !== undefined) {
      updatedStats.visitsReceived = args.visitsReceived
    }
    if (args.packagesReceived !== undefined) {
      updatedStats.packagesReceived = args.packagesReceived
    }
    if (args.hseTrainingsCompleted !== undefined) {
      updatedStats.hseTrainingsCompleted = args.hseTrainingsCompleted
    }

    await ctx.db.patch(args.id, { stats: updatedStats })
  },
})
