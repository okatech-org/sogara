import { Vacation, Payslip, PayslipItem, PayrollConfig } from '@/types'

export class PayrollCalculatorService {
  private config: PayrollConfig

  constructor() {
    this.config = {
      overtimeMultiplier: 1.5,
      nightMultiplier: 1.25,
      hazardMultiplier: 1.15,
      weekendMultiplier: 1.5,
      socialSecurityRate: 0.15,
      incomeTaxRate: 0.2,
      transportAllowance: 50000,
      mealAllowancePerDay: 5000,
    }
  }

  /**
   * Calcule la fiche de paie pour un employé sur un mois
   */
  calculatePayslip(
    employeeId: string,
    baseSalary: number,
    vacations: Vacation[],
    month: number,
    year: number,
  ): {
    payslip: Omit<Payslip, 'id' | 'items' | 'createdAt' | 'updatedAt'>
    items: Omit<PayslipItem, 'id' | 'payslipId' | 'createdAt'>[]
  } {
    const hourlyRate = this.calculateHourlyRate(baseSalary)

    let totalHours = 0
    let regularHours = 0
    let overtimeHours = 0
    let nightHours = 0
    let weekendHours = 0

    const items: Omit<PayslipItem, 'id' | 'payslipId' | 'createdAt'>[] = []

    const completedVacations = vacations.filter(
      v => v.status === 'COMPLETED' || v.status === 'IN_PROGRESS',
    )

    for (const vacation of completedVacations) {
      const hours = vacation.actualHours || vacation.plannedHours
      const isNight = vacation.type.includes('NIGHT')
      const isWeekend = this.isWeekend(vacation.date)

      totalHours += hours

      // Heures normales vs supplémentaires
      if (regularHours + hours <= 173) {
        regularHours += hours
        items.push({
          vacationId: vacation.id,
          date: vacation.date,
          description: `Vacation ${vacation.type} - ${vacation.siteName}`,
          hours,
          rate: hourlyRate,
          amount: hours * hourlyRate,
          type: 'regular',
        })
      } else {
        const regularPart = Math.max(0, 173 - regularHours)
        const overtimePart = hours - regularPart

        if (regularPart > 0) {
          regularHours += regularPart
          items.push({
            vacationId: vacation.id,
            date: vacation.date,
            description: 'Heures normales',
            hours: regularPart,
            rate: hourlyRate,
            amount: regularPart * hourlyRate,
            type: 'regular',
          })
        }

        if (overtimePart > 0) {
          overtimeHours += overtimePart
          const overtimeRate = hourlyRate * this.config.overtimeMultiplier
          items.push({
            vacationId: vacation.id,
            date: vacation.date,
            description: 'Heures supplémentaires',
            hours: overtimePart,
            rate: overtimeRate,
            amount: overtimePart * overtimeRate,
            type: 'overtime',
          })
        }
      }

      // Prime de nuit
      if (isNight) {
        nightHours += hours
        const nightBonus = hours * hourlyRate * (this.config.nightMultiplier - 1)
        items.push({
          vacationId: vacation.id,
          date: vacation.date,
          description: 'Prime de nuit',
          hours,
          rate: hourlyRate * (this.config.nightMultiplier - 1),
          amount: nightBonus,
          type: 'night',
        })
      }

      // Majoration week-end
      if (isWeekend) {
        weekendHours += hours
        const weekendBonus = hours * hourlyRate * (this.config.weekendMultiplier - 1)
        items.push({
          vacationId: vacation.id,
          date: vacation.date,
          description: 'Majoration week-end',
          hours,
          rate: hourlyRate * (this.config.weekendMultiplier - 1),
          amount: weekendBonus,
          type: 'weekend',
        })
      }
    }

    // Calcul des primes
    const daysWorked = new Set(completedVacations.map(v => v.date.toISOString())).size

    const overtimePay = items
      .filter(i => i.type === 'overtime')
      .reduce((sum, i) => sum + i.amount, 0)

    const nightPay = items.filter(i => i.type === 'night').reduce((sum, i) => sum + i.amount, 0)

    const weekendPay = items.filter(i => i.type === 'weekend').reduce((sum, i) => sum + i.amount, 0)

    const hazardPay = totalHours * hourlyRate * (this.config.hazardMultiplier - 1)
    const transportAllowance = this.config.transportAllowance
    const mealAllowance = daysWorked * this.config.mealAllowancePerDay

    // Salaire brut
    const regularPay = regularHours * hourlyRate
    const grossSalary =
      regularPay +
      overtimePay +
      nightPay +
      weekendPay +
      hazardPay +
      transportAllowance +
      mealAllowance

    // Déductions
    const socialSecurity = grossSalary * this.config.socialSecurityRate
    const incomeTax = (grossSalary - socialSecurity) * this.config.incomeTaxRate

    // Salaire net
    const netSalary = grossSalary - socialSecurity - incomeTax

    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 0)

    return {
      payslip: {
        employeeId,
        month,
        year,
        periodStart,
        periodEnd,
        baseSalary,
        grossSalary,
        netSalary,
        totalHours,
        overtimeHours,
        nightHours,
        overtimePay,
        nightPay,
        hazardPay,
        transportAllowance,
        mealAllowance,
        otherBonuses: 0,
        socialSecurity,
        incomeTax,
        otherDeductions: 0,
        status: 'DRAFT',
        generatedAt: new Date(),
        isValidated: false,
      },
      items,
    }
  }

  private calculateHourlyRate(monthlySalary: number): number {
    return monthlySalary / 173
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  /**
   * Formatte un montant en FCFA
   */
  formatCurrency(amount: number): string {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    )
  }
}

export const payrollCalculator = new PayrollCalculatorService()
