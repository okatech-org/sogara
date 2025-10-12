import { useMemo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Payslip } from '@/types';
import { toast } from './use-toast';
import { Id } from "../../convex/_generated/dataModel";
import { useVacations } from './useVacations';
import { payrollCalculator } from '@/services/payroll-calculator.service';

export function usePayroll() {
  const payslipsData = useQuery(api.payslips.list);
  const upsertMutation = useMutation(api.payslips.upsert);
  const validateMutation = useMutation(api.payslips.validate);
  const markAsPaidMutation = useMutation(api.payslips.markAsPaid);
  const { vacations } = useVacations();

  const payslips: Payslip[] = useMemo(() => (
    (payslipsData || []).map((p: any) => ({
      id: p._id,
      month: p.month,
      year: p.year,
      periodStart: new Date(p.periodStart),
      periodEnd: new Date(p.periodEnd),
      employeeId: p.employeeId,
      baseSalary: p.baseSalary,
      grossSalary: p.grossSalary,
      netSalary: p.netSalary,
      totalHours: p.totalHours,
      overtimeHours: p.overtimeHours,
      nightHours: p.nightHours,
      overtimePay: p.overtimePay,
      nightPay: p.nightPay,
      hazardPay: p.hazardPay,
      transportAllowance: p.transportAllowance,
      mealAllowance: p.mealAllowance,
      otherBonuses: p.otherBonuses || 0,
      socialSecurity: p.socialSecurity,
      incomeTax: p.incomeTax,
      otherDeductions: p.otherDeductions || 0,
      status: p.status,
      generatedAt: new Date(p._creationTime),
      validatedAt: p.validatedAt ? new Date(p.validatedAt) : undefined,
      validatedBy: p.validatedBy,
      paidAt: p.paidAt ? new Date(p.paidAt) : undefined,
      pdfUrl: p.pdfUrl,
      items: [],
      createdAt: new Date(p._creationTime),
      updatedAt: new Date(p._creationTime),
    }))
  ), [payslipsData]);

  const generateOrUpdatePayslip = async (
    employeeId: string,
    baseSalary: number,
    month: number,
    year: number
  ) => {
    try {
      // Récupérer les vacations du mois
      const employeeVacations = vacations.filter(v => {
        const vDate = new Date(v.date);
        return v.employeeId === employeeId &&
               vDate.getMonth() + 1 === month &&
               vDate.getFullYear() === year;
      });

      // Calculer la paie
      const { payslip, items } = payrollCalculator.calculatePayslip(
        employeeId,
        baseSalary,
        employeeVacations,
        month,
        year
      );

      // Sauvegarder dans Convex
      await upsertMutation({
        employeeId: employeeId as Id<"employees">,
        month,
        year,
        periodStart: payslip.periodStart.getTime(),
        periodEnd: payslip.periodEnd.getTime(),
        baseSalary: payslip.baseSalary,
        grossSalary: payslip.grossSalary,
        netSalary: payslip.netSalary,
        totalHours: payslip.totalHours,
        overtimeHours: payslip.overtimeHours,
        nightHours: payslip.nightHours,
        overtimePay: payslip.overtimePay,
        nightPay: payslip.nightPay,
        hazardPay: payslip.hazardPay,
        transportAllowance: payslip.transportAllowance,
        mealAllowance: payslip.mealAllowance,
        socialSecurity: payslip.socialSecurity,
        incomeTax: payslip.incomeTax,
        status: payslip.status,
      });

      toast({
        title: 'Fiche de paie générée',
        description: `Paie calculée pour ${month}/${year}`,
      });

      return payslip;
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer la fiche de paie.',
        variant: 'destructive',
      });
    }
  };

  const getMyPayslip = (employeeId: string, month: number, year: number) => {
    return payslips.find(p => 
      p.employeeId === employeeId &&
      p.month === month &&
      p.year === year
    );
  };

  const validatePayslip = async (payslipId: string, validatedBy: string) => {
    try {
      await validateMutation({
        id: payslipId as Id<"payslips">,
        validatedBy: validatedBy as Id<"employees">,
      });
      toast({ title: 'Fiche de paie validée' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const markAsPaid = async (payslipId: string) => {
    try {
      await markAsPaidMutation({ id: payslipId as Id<"payslips"> });
      toast({ title: 'Paiement effectué', description: 'Fiche marquée comme payée.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const getStats = (month: number, year: number) => {
    const periodPayslips = payslips.filter(p => p.month === month && p.year === year);
    
    return {
      totalPayslips: periodPayslips.length,
      totalGross: periodPayslips.reduce((sum, p) => sum + p.grossSalary, 0),
      totalNet: periodPayslips.reduce((sum, p) => sum + p.netSalary, 0),
      totalHours: periodPayslips.reduce((sum, p) => sum + p.totalHours, 0),
      validated: periodPayslips.filter(p => p.status === 'VALIDATED').length,
      paid: periodPayslips.filter(p => p.status === 'PAID').length,
    };
  };

  return {
    payslips,
    loading: payslipsData === undefined,
    generateOrUpdatePayslip,
    getMyPayslip,
    validatePayslip,
    markAsPaid,
    getStats,
  };
}

