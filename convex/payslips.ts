import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CREATE or UPDATE Payslip
export const upsert = mutation({
  args: {
    employeeId: v.id("employees"),
    month: v.number(),
    year: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    baseSalary: v.number(),
    grossSalary: v.number(),
    netSalary: v.number(),
    totalHours: v.number(),
    overtimeHours: v.number(),
    nightHours: v.number(),
    overtimePay: v.number(),
    nightPay: v.number(),
    hazardPay: v.number(),
    transportAllowance: v.number(),
    mealAllowance: v.number(),
    otherBonuses: v.optional(v.number()),
    socialSecurity: v.number(),
    incomeTax: v.number(),
    otherDeductions: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Chercher une fiche de paie existante
    const existing = await ctx.db
      .query("payslips")
      .filter((q) => 
        q.and(
          q.eq(q.field("employeeId"), args.employeeId),
          q.eq(q.field("month"), args.month),
          q.eq(q.field("year"), args.year)
        )
      )
      .first();

    if (existing) {
      // Mise à jour
      await ctx.db.patch(existing._id, {
        ...args,
        status: args.status || 'DRAFT',
      });
      return existing._id;
    } else {
      // Création
      const payslipId = await ctx.db.insert("payslips", {
        ...args,
        status: args.status || 'DRAFT',
        isValidated: false,
      });
      return payslipId;
    }
  },
});

// GET Payslip
export const getByEmployeeAndPeriod = query({
  args: {
    employeeId: v.id("employees"),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payslips")
      .filter((q) =>
        q.and(
          q.eq(q.field("employeeId"), args.employeeId),
          q.eq(q.field("month"), args.month),
          q.eq(q.field("year"), args.year)
        )
      )
      .first();
  },
});

// LIST all Payslips
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("payslips").collect();
  },
});

// LIST by Month/Year
export const listByPeriod = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payslips")
      .filter((q) =>
        q.and(
          q.eq(q.field("month"), args.month),
          q.eq(q.field("year"), args.year)
        )
      )
      .collect();
  },
});

// VALIDATE Payslip
export const validate = mutation({
  args: {
    id: v.id("payslips"),
    validatedBy: v.id("employees"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'VALIDATED',
      isValidated: true,
      validatedBy: args.validatedBy,
      validatedAt: Date.now(),
    });
  },
});

// MARK as PAID
export const markAsPaid = mutation({
  args: { id: v.id("payslips") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'PAID',
      paidAt: Date.now(),
    });
  },
});

