import { useCallback } from 'react'
import { EmployeeCompliance, ComplianceData, UserRole } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { useHSETrainings } from './useHSETrainings'

export function useHSECompliance() {
  const { state } = useApp()
  const { trainings, getExpiredTrainings, getExpiringTrainings } = useHSETrainings()

  const checkEmployeeCompliance = useCallback(
    (employeeId: string): EmployeeCompliance | null => {
      const employee = state.employees.find(e => e.id === employeeId)
      if (!employee) return null

      const requiredTrainings = trainings.filter(t =>
        t.requiredForRoles.some(role => employee.roles.includes(role)),
      )

      if (requiredTrainings.length === 0) {
        return {
          employeeId,
          totalRequired: 0,
          completed: 0,
          expired: 0,
          missing: 0,
          rate: 100,
        }
      }

      let completed = 0
      let expired = 0
      let missing = 0
      const now = new Date()

      requiredTrainings.forEach(training => {
        let hasValidCertification = false
        let hasExpiredCertification = false

        training.sessions.forEach(session => {
          const attendance = session.attendance.find(
            a => a.employeeId === employeeId && a.status === 'completed',
          )

          if (attendance) {
            if (attendance.expirationDate) {
              if (attendance.expirationDate > now) {
                hasValidCertification = true
              } else {
                hasExpiredCertification = true
              }
            } else {
              // Certification sans date d'expiration (ancienne certification)
              hasValidCertification = true
            }
          }
        })

        if (hasValidCertification) {
          completed++
        } else if (hasExpiredCertification) {
          expired++
        } else {
          missing++
        }
      })

      const rate = Math.round((completed / requiredTrainings.length) * 100)

      return {
        employeeId,
        totalRequired: requiredTrainings.length,
        completed,
        expired,
        missing,
        rate,
      }
    },
    [state.employees, trainings],
  )

  const getServiceCompliance = useCallback(
    (service: string): ComplianceData => {
      const serviceEmployees = state.employees.filter(emp => emp.service === service)

      if (serviceEmployees.length === 0) {
        return {
          service,
          complianceRate: 100,
          expiredTrainings: 0,
          employeesCount: 0,
        }
      }

      let totalComplianceScore = 0
      let totalExpiredTrainings = 0

      serviceEmployees.forEach(employee => {
        const compliance = checkEmployeeCompliance(employee.id)
        if (compliance) {
          totalComplianceScore += compliance.rate
          totalExpiredTrainings += compliance.expired
        }
      })

      return {
        service,
        complianceRate: Math.round(totalComplianceScore / serviceEmployees.length),
        expiredTrainings: totalExpiredTrainings,
        employeesCount: serviceEmployees.length,
      }
    },
    [state.employees, checkEmployeeCompliance],
  )

  const getRoleCompliance = useCallback(
    (role: UserRole): ComplianceData => {
      const roleEmployees = state.employees.filter(emp => emp.roles.includes(role))

      if (roleEmployees.length === 0) {
        return {
          service: role,
          complianceRate: 100,
          expiredTrainings: 0,
          employeesCount: 0,
        }
      }

      let totalComplianceScore = 0
      let totalExpiredTrainings = 0

      roleEmployees.forEach(employee => {
        const compliance = checkEmployeeCompliance(employee.id)
        if (compliance) {
          totalComplianceScore += compliance.rate
          totalExpiredTrainings += compliance.expired
        }
      })

      return {
        service: role,
        complianceRate: Math.round(totalComplianceScore / roleEmployees.length),
        expiredTrainings: totalExpiredTrainings,
        employeesCount: roleEmployees.length,
      }
    },
    [state.employees, checkEmployeeCompliance],
  )

  const getOverallCompliance = useCallback(() => {
    if (state.employees.length === 0) return 100

    let totalComplianceScore = 0

    state.employees.forEach(employee => {
      const compliance = checkEmployeeCompliance(employee.id)
      if (compliance) {
        totalComplianceScore += compliance.rate
      }
    })

    return Math.round(totalComplianceScore / state.employees.length)
  }, [state.employees, checkEmployeeCompliance])

  const generateComplianceReport = useCallback(() => {
    const services = [...new Set(state.employees.map(emp => emp.service))]
    const roles: UserRole[] = ['EMPLOYE', 'SUPERVISEUR', 'HSE', 'ADMIN']

    const serviceCompliance = services.map(service => getServiceCompliance(service))
    const roleCompliance = roles.map(role => getRoleCompliance(role))

    const overallCompliance = getOverallCompliance()

    // Employés avec des formations expirées
    const employeesWithExpiredTrainings = state.employees
      .map(employee => ({
        employee,
        expiredCount: getExpiredTrainings(employee.id).length,
      }))
      .filter(item => item.expiredCount > 0)
      .sort((a, b) => b.expiredCount - a.expiredCount)

    // Employés avec des formations qui expirent bientôt
    const employeesWithExpiringTrainings = state.employees
      .map(employee => ({
        employee,
        expiringTrainings: getExpiringTrainings(employee.id, 30),
      }))
      .filter(item => item.expiringTrainings.length > 0)
      .sort((a, b) => {
        const aMinDays = Math.min(...a.expiringTrainings.map(t => t.daysUntilExpiry))
        const bMinDays = Math.min(...b.expiringTrainings.map(t => t.daysUntilExpiry))
        return aMinDays - bMinDays
      })

    // Services nécessitant une attention particulière (conformité < 90%)
    const servicesNeedingAttention = serviceCompliance
      .filter(sc => sc.complianceRate < 90)
      .sort((a, b) => a.complianceRate - b.complianceRate)

    return {
      overallCompliance,
      serviceCompliance,
      roleCompliance,
      employeesWithExpiredTrainings,
      employeesWithExpiringTrainings,
      servicesNeedingAttention,
      totalEmployees: state.employees.length,
      totalServices: services.length,
      reportGeneratedAt: new Date(),
    }
  }, [
    state.employees,
    getServiceCompliance,
    getRoleCompliance,
    getOverallCompliance,
    getExpiredTrainings,
    getExpiringTrainings,
  ])

  const getEmployeesRequiringAction = useCallback(() => {
    const needsAction: Array<{
      employee: (typeof state.employees)[0]
      compliance: EmployeeCompliance
      issues: string[]
      priority: 'high' | 'medium' | 'low'
    }> = []

    state.employees.forEach(employee => {
      const compliance = checkEmployeeCompliance(employee.id)
      if (!compliance) return

      const issues: string[] = []
      let priority: 'high' | 'medium' | 'low' = 'low'

      if (compliance.expired > 0) {
        issues.push(`${compliance.expired} formation(s) expirée(s)`)
        priority = 'high'
      }

      if (compliance.missing > 0) {
        issues.push(`${compliance.missing} formation(s) manquante(s)`)
        if (priority !== 'high') priority = 'medium'
      }

      const expiring = getExpiringTrainings(employee.id, 30)
      if (expiring.length > 0) {
        const minDays = Math.min(...expiring.map(e => e.daysUntilExpiry))
        issues.push(`${expiring.length} formation(s) expire(nt) dans ${minDays} jour(s)`)
        if (minDays <= 7 && priority === 'low') priority = 'medium'
      }

      if (compliance.rate < 90) {
        issues.push(`Taux de conformité: ${compliance.rate}%`)
        if (compliance.rate < 70) priority = 'high'
        else if (priority === 'low') priority = 'medium'
      }

      if (issues.length > 0) {
        needsAction.push({
          employee,
          compliance,
          issues,
          priority,
        })
      }
    })

    // Trier par priorité (high -> medium -> low) puis par taux de conformité croissant
    return needsAction.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]

      if (priorityDiff !== 0) return priorityDiff
      return a.compliance.rate - b.compliance.rate
    })
  }, [state.employees, checkEmployeeCompliance, getExpiringTrainings])

  const getComplianceTrends = useCallback(
    (months: number = 6) => {
      // Simuler l'évolution de la conformité sur les derniers mois
      // Dans une vraie application, ces données seraient stockées historiquement
      const trends = []
      const currentCompliance = getOverallCompliance()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)

        // Simulation d'une tendance avec une légère variabilité
        const variation = (Math.random() - 0.5) * 10 // Variation de ±5%
        const compliance = Math.max(70, Math.min(100, currentCompliance + variation))

        trends.push({
          month: date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }),
          compliance: Math.round(compliance),
          date,
        })
      }

      return trends
    },
    [getOverallCompliance],
  )

  return {
    checkEmployeeCompliance,
    getServiceCompliance,
    getRoleCompliance,
    getOverallCompliance,
    generateComplianceReport,
    getEmployeesRequiringAction,
    getComplianceTrends,
  }
}
