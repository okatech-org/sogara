import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// CREATE Equipment
export const create = mutation({
  args: {
    type: v.string(),
    label: v.string(),
    serialNumber: v.optional(v.string()),
    holderEmployeeId: v.optional(v.id('employees')),
    status: v.string(), // "operational" | "maintenance" | "out_of_service"
    nextCheckDate: v.optional(v.number()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    warrantyExpiryDate: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const equipmentId = await ctx.db.insert('equipment', {
      type: args.type,
      label: args.label,
      serialNumber: args.serialNumber,
      holderEmployeeId: args.holderEmployeeId,
      status: args.status,
      nextCheckDate: args.nextCheckDate,
      description: args.description,
      location: args.location,
      purchaseDate: args.purchaseDate,
      warrantyExpiryDate: args.warrantyExpiryDate,
      manufacturer: args.manufacturer,
      model: args.model,
    })

    return equipmentId
  },
})

// LIST all equipment
export const list = query({
  args: {},
  handler: async ctx => {
    const equipment = await ctx.db.query('equipment').collect()

    // Enrichir avec les données du détenteur
    const enrichedEquipment = await Promise.all(
      equipment.map(async eq => {
        const holder = eq.holderEmployeeId ? await ctx.db.get(eq.holderEmployeeId) : null
        return {
          ...eq,
          holderEmployee: holder,
        }
      }),
    )

    return enrichedEquipment
  },
})

// LIST equipment by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const equipment = await ctx.db
      .query('equipment')
      .withIndex('by_status', q => q.eq('status', args.status))
      .collect()

    const enrichedEquipment = await Promise.all(
      equipment.map(async eq => {
        const holder = eq.holderEmployeeId ? await ctx.db.get(eq.holderEmployeeId) : null
        return {
          ...eq,
          holderEmployee: holder,
        }
      }),
    )

    return enrichedEquipment
  },
})

// LIST equipment by holder
export const listByHolder = query({
  args: { holderEmployeeId: v.id('employees') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('equipment')
      .withIndex('by_holder', q => q.eq('holderEmployeeId', args.holderEmployeeId))
      .collect()
  },
})

// LIST equipment by type
export const listByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('equipment')
      .withIndex('by_type', q => q.eq('type', args.type))
      .collect()
  },
})

// GET equipment by ID
export const getById = query({
  args: { id: v.id('equipment') },
  handler: async (ctx, args) => {
    const equipment = await ctx.db.get(args.id)
    if (!equipment) return null

    const holder = equipment.holderEmployeeId ? await ctx.db.get(equipment.holderEmployeeId) : null

    return {
      ...equipment,
      holderEmployee: holder,
    }
  },
})

// UPDATE equipment
export const update = mutation({
  args: {
    id: v.id('equipment'),
    holderEmployeeId: v.optional(v.id('employees')),
    status: v.optional(v.string()),
    nextCheckDate: v.optional(v.number()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const updateData: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateData[key] = value
      }
    }

    await ctx.db.patch(id, updateData)
  },
})

// ASSIGN to employee
export const assignToEmployee = mutation({
  args: {
    equipmentId: v.id('equipment'),
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.equipmentId, {
      holderEmployeeId: args.employeeId,
    })
  },
})

// UNASSIGN from employee
export const unassign = mutation({
  args: { equipmentId: v.id('equipment') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.equipmentId, {
      holderEmployeeId: undefined,
    })
  },
})

// DELETE equipment
export const remove = mutation({
  args: { id: v.id('equipment') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// GET statistics
export const getStats = query({
  args: {},
  handler: async ctx => {
    const allEquipment = await ctx.db.query('equipment').collect()
    const now = Date.now()
    const nextWeek = now + 7 * 24 * 60 * 60 * 1000

    return {
      needsCheck: allEquipment.filter(eq => eq.nextCheckDate && eq.nextCheckDate <= nextWeek)
        .length,
      inMaintenance: allEquipment.filter(eq => eq.status === 'maintenance').length,
      operational: allEquipment.filter(eq => eq.status === 'operational').length,
    }
  },
})
