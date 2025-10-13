import { HSETraining, HSETrainingSession, HSEAttendance, UserRole, Employee } from '@/types'
import { repositories } from './repositories'
import hseModulesData from '@/data/hse-training-modules.json'

interface TrainingModule {
  id: string
  code: string
  title: string
  category: string
  description: string
  objectives: string[]
  duration: number
  durationUnit: string
  validityMonths: number
  requiredForRoles: UserRole[]
  prerequisites: string[]
  certification: {
    examRequired: boolean
    passingScore: number | null
    practicalTest: boolean
    certificateType: string
  }
  instructor: {
    qualificationRequired: string
    minExperience: string
  }
  maxParticipants: number
  language: string[]
  deliveryMethods: string[]
  refresherRequired: boolean
  refresherFrequency: number
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

class HSETrainingImporterService {
  /**
   * Importe tous les modules de formation depuis le JSON
   */
  async importTrainingModules(): Promise<HSETraining[]> {
    const importedTrainings: HSETraining[] = []

    for (const module of hseModulesData.hseTrainingModules) {
      const existingTraining = await repositories.hseTrainings
        .getAll()
        .then(trainings => trainings.find(t => t.title === module.title))

      if (!existingTraining) {
        const training: HSETraining = {
          id: generateId(),
          title: module.title,
          description: module.description,
          requiredForRoles: module.requiredForRoles as UserRole[],
          duration: module.duration * 60, // Convertir heures en minutes
          validityMonths: module.validityMonths,
          sessions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const savedTraining = await repositories.hseTrainings.create(training)
        importedTrainings.push(savedTraining)
        console.log(`✅ Formation importée: ${module.title}`)
      } else {
        console.log(`⚠️ Formation déjà existante: ${module.title}`)
      }
    }

    return importedTrainings
  }

  /**
   * Analyse les besoins de formation pour tous les employés
   */
  async analyzeTrainingNeeds(): Promise<
    {
      employeeId: string
      employee: Employee
      requiredTrainings: HSETraining[]
      missingTrainings: HSETraining[]
      expiredTrainings: Array<{ training: HSETraining; expirationDate: Date }>
      complianceRate: number
    }[]
  > {
    const employees = repositories.employees.getAll()
    const trainings = await repositories.hseTrainings.getAll()
    const analysisResults = []

    for (const employee of employees) {
      // Formations requises selon les rôles
      const requiredTrainings = trainings.filter(training =>
        training.requiredForRoles.some(role => employee.roles.includes(role)),
      )

      // Formations manquantes (jamais suivies)
      const missingTrainings = requiredTrainings.filter(training => {
        const hasCompleted = training.sessions.some(session =>
          session.attendance.some(
            att => att.employeeId === employee.id && att.status === 'completed',
          ),
        )
        return !hasCompleted
      })

      // Formations expirées
      const expiredTrainings: Array<{ training: HSETraining; expirationDate: Date }> = []
      const now = new Date()

      for (const training of requiredTrainings) {
        for (const session of training.sessions) {
          const attendance = session.attendance.find(
            att =>
              att.employeeId === employee.id && att.status === 'completed' && att.expirationDate,
          )

          if (attendance && attendance.expirationDate && attendance.expirationDate < now) {
            expiredTrainings.push({
              training,
              expirationDate: attendance.expirationDate,
            })
          }
        }
      }

      // Calcul du taux de conformité
      const validTrainings =
        requiredTrainings.length - missingTrainings.length - expiredTrainings.length
      const complianceRate =
        requiredTrainings.length > 0
          ? Math.round((validTrainings / requiredTrainings.length) * 100)
          : 100

      analysisResults.push({
        employeeId: employee.id,
        employee,
        requiredTrainings,
        missingTrainings,
        expiredTrainings,
        complianceRate,
      })
    }

    return analysisResults
  }

  /**
   * Planifie automatiquement les sessions de formation nécessaires
   */
  async planTrainingSessions(weeksAhead: number = 12): Promise<HSETrainingSession[]> {
    const trainingNeeds = await this.analyzeTrainingNeeds()
    const trainings = await repositories.hseTrainings.getAll()
    const plannedSessions: HSETrainingSession[] = []

    // Regrouper les besoins par formation
    const needsByTraining = new Map<
      string,
      {
        training: HSETraining
        urgentEmployees: Employee[] // Formations expirées
        normalEmployees: Employee[] // Formations manquantes
      }
    >()

    trainingNeeds.forEach(need => {
      need.missingTrainings.forEach(training => {
        if (!needsByTraining.has(training.id)) {
          needsByTraining.set(training.id, {
            training,
            urgentEmployees: [],
            normalEmployees: [],
          })
        }
        needsByTraining.get(training.id).normalEmployees.push(need.employee)
      })

      need.expiredTrainings.forEach(({ training }) => {
        if (!needsByTraining.has(training.id)) {
          needsByTraining.set(training.id, {
            training,
            urgentEmployees: [],
            normalEmployees: [],
          })
        }
        needsByTraining.get(training.id).urgentEmployees.push(need.employee)
      })
    })

    // Planifier les sessions
    const currentDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + weeksAhead * 7)

    for (const [trainingId, data] of needsByTraining) {
      const { training, urgentEmployees, normalEmployees } = data
      const allEmployees = [...urgentEmployees, ...normalEmployees]

      if (allEmployees.length === 0) continue

      // Obtenir les informations du module original
      const moduleInfo = hseModulesData.hseTrainingModules.find(m => m.title === training.title)
      if (!moduleInfo) continue

      // Calculer le nombre de sessions nécessaires
      const sessionsNeeded = Math.ceil(allEmployees.length / moduleInfo.maxParticipants)

      for (let sessionIndex = 0; sessionIndex < sessionsNeeded; sessionIndex++) {
        // Planifier les sessions urgentes en premier (dans les 2 semaines)
        const isUrgentSession = sessionIndex === 0 && urgentEmployees.length > 0
        const sessionDate = new Date(currentDate)

        if (isUrgentSession) {
          sessionDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 14) + 1) // 1-14 jours
        } else {
          sessionDate.setDate(
            currentDate.getDate() + Math.floor(Math.random() * weeksAhead * 7) + 14,
          ) // Après 2 semaines
        }

        // Éviter les weekends
        if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) {
          sessionDate.setDate(sessionDate.getDate() + (8 - sessionDate.getDay()))
        }

        // Heure de formation (8h ou 14h)
        sessionDate.setHours(Math.random() > 0.5 ? 8 : 14, 0, 0, 0)

        // Sélectionner les participants pour cette session
        const startIndex = sessionIndex * moduleInfo.maxParticipants
        const sessionEmployees = allEmployees.slice(
          startIndex,
          startIndex + moduleInfo.maxParticipants,
        )

        if (sessionEmployees.length === 0) break

        // Créer la session
        const session: HSETrainingSession = {
          id: generateId(),
          trainingId: training.id,
          date: sessionDate,
          instructor: this.getInstructorName(moduleInfo),
          location: this.getTrainingLocation(moduleInfo),
          maxParticipants: moduleInfo.maxParticipants,
          attendance: sessionEmployees.map(emp => ({
            employeeId: emp.id,
            status: 'registered',
          })),
          status: 'scheduled',
        }

        // Ajouter la session via le repository
        const createdSession = await repositories.hseTrainings.createSession(training.id, session)
        if (createdSession) {
          plannedSessions.push(createdSession)
          console.log(
            `📅 Session planifiée: ${training.title} - ${sessionDate.toLocaleDateString()} (${sessionEmployees.length} participants)`,
          )
        }
      }
    }

    return plannedSessions
  }

  /**
   * Simule la complétion des formations et génère des certifications
   */
  async simulateTrainingCompletions(): Promise<void> {
    const trainings = await repositories.hseTrainings.getAll()
    const now = new Date()

    for (const training of trainings) {
      for (const session of training.sessions) {
        if (session.status === 'scheduled' && session.date < now) {
          // Marquer la session comme complétée
          session.status = 'completed'

          // Simuler les présences et certifications
          session.attendance.forEach(attendance => {
            if (Math.random() > 0.1) {
              // 90% de taux de présence
              attendance.status = 'completed'
              attendance.score = Math.floor(Math.random() * 20) + 80 // Score entre 80 et 100
              attendance.certificationDate = session.date

              // Calculer la date d'expiration
              const expirationDate = new Date(session.date)
              expirationDate.setMonth(expirationDate.getMonth() + training.validityMonths)
              attendance.expirationDate = expirationDate

              console.log(
                `🎓 Certification générée pour employé ${attendance.employeeId} - ${training.title}`,
              )
            } else {
              attendance.status = 'absent'
            }
          })

          // Sauvegarder les modifications
          await repositories.hseTrainings.update(training.id, { sessions: training.sessions })
        }
      }
    }
  }

  /**
   * Génère un rapport complet de conformité
   */
  async generateComplianceReport(): Promise<{
    summary: {
      totalEmployees: number
      overallCompliance: number
      criticalTrainings: number
      upcomingSessions: number
    }
    byCategory: Array<{
      category: string
      trainingsCount: number
      averageCompliance: number
    }>
    byRole: Array<{
      role: UserRole
      employeesCount: number
      averageCompliance: number
      criticalIssues: number
    }>
    urgentActions: Array<{
      type: 'missing' | 'expired'
      employeeId: string
      employeeName: string
      trainingTitle: string
      daysOverdue?: number
    }>
  }> {
    const trainingNeeds = await this.analyzeTrainingNeeds()
    const trainings = await repositories.hseTrainings.getAll()
    const employees = repositories.employees.getAll()

    // Résumé global
    const overallCompliance = Math.round(
      trainingNeeds.reduce((sum, need) => sum + need.complianceRate, 0) / trainingNeeds.length,
    )

    // Par catégorie
    const categories = [...new Set(hseModulesData.hseTrainingModules.map(m => m.category))]
    const byCategory = categories.map(category => {
      const categoryModules = hseModulesData.hseTrainingModules.filter(m => m.category === category)
      const categoryTrainings = trainings.filter(t =>
        categoryModules.some(m => m.title === t.title),
      )

      return {
        category,
        trainingsCount: categoryTrainings.length,
        averageCompliance: overallCompliance, // Simplification pour l'exemple
      }
    })

    // Par rôle
    const roles: UserRole[] = ['EMPLOYE', 'SUPERVISEUR', 'HSE', 'ADMIN']
    const byRole = roles.map(role => {
      const roleEmployees = employees.filter(emp => emp.roles.includes(role))
      const roleNeeds = trainingNeeds.filter(need => need.employee.roles.includes(role))
      const averageCompliance =
        roleNeeds.length > 0
          ? Math.round(
              roleNeeds.reduce((sum, need) => sum + need.complianceRate, 0) / roleNeeds.length,
            )
          : 100

      const criticalIssues = roleNeeds.reduce((sum, need) => sum + need.expiredTrainings.length, 0)

      return {
        role,
        employeesCount: roleEmployees.length,
        averageCompliance,
        criticalIssues,
      }
    })

    // Actions urgentes
    const urgentActions: Array<{
      type: 'missing' | 'expired'
      employeeId: string
      employeeName: string
      trainingTitle: string
      daysOverdue?: number
    }> = []

    trainingNeeds.forEach(need => {
      // Formations expirées
      need.expiredTrainings.forEach(({ training, expirationDate }) => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24),
        )

        urgentActions.push({
          type: 'expired',
          employeeId: need.employee.id,
          employeeName: `${need.employee.firstName} ${need.employee.lastName}`,
          trainingTitle: training.title,
          daysOverdue,
        })
      })

      // Formations critiques manquantes
      const criticalTrainings = need.missingTrainings.filter(training => {
        const module = hseModulesData.hseTrainingModules.find(m => m.title === training.title)
        return module?.category === 'Critique' || module?.category === 'Obligatoire'
      })

      criticalTrainings.forEach(training => {
        urgentActions.push({
          type: 'missing',
          employeeId: need.employee.id,
          employeeName: `${need.employee.firstName} ${need.employee.lastName}`,
          trainingTitle: training.title,
        })
      })
    })

    const upcomingSessions = trainings.reduce(
      (sum, training) => sum + training.sessions.filter(s => s.status === 'scheduled').length,
      0,
    )

    return {
      summary: {
        totalEmployees: employees.length,
        overallCompliance,
        criticalTrainings: hseModulesData.hseTrainingModules.filter(m => m.category === 'Critique')
          .length,
        upcomingSessions,
      },
      byCategory,
      byRole,
      urgentActions: urgentActions.slice(0, 20), // Limiter à 20 actions urgentes
    }
  }

  private getInstructorName(module: TrainingModule): string {
    const instructors = {
      'HSE-001': 'Lié Orphée BOURDES',
      'HSE-002': 'Jean-Pierre MOUKALA',
      'HSE-003': 'Commandant ESSONO',
      'HSE-004': 'Expert TOTAL E&P',
      'HSE-005': 'Formateur DEKRA',
      'HSE-006': 'Dr. NGOUA (Chimiste)',
      'HSE-007': 'Lié Orphée BOURDES',
      'HSE-008': 'Dr. MBADINGA (Médecin)',
      'HSE-015': 'Expert SCHLUMBERGER',
    }

    return instructors[module.id as keyof typeof instructors] || 'Formateur externe'
  }

  private getTrainingLocation(module: TrainingModule): string {
    if (module.deliveryMethods.includes('E-learning')) {
      return 'Salle informatique'
    }

    if (module.category === 'Critique' || module.practicalTest) {
      return 'Centre de formation HSE'
    }

    return Math.random() > 0.5 ? 'Salle de formation A' : 'Auditorium principal'
  }

  /**
   * Initialise complètement le système de formation HSE
   */
  async initializeHSETrainingSystem(): Promise<void> {
    console.log('🚀 Initialisation du système de formation HSE...')

    try {
      // 1. Importer les modules
      const importedTrainings = await this.importTrainingModules()
      console.log(`✅ ${importedTrainings.length} modules importés`)

      // 2. Analyser les besoins
      const trainingNeeds = await this.analyzeTrainingNeeds()
      console.log(`📊 Analyse terminée pour ${trainingNeeds.length} employés`)

      // 3. Planifier les sessions
      const plannedSessions = await this.planTrainingSessions(16) // 4 mois à l'avance
      console.log(`📅 ${plannedSessions.length} sessions planifiées`)

      // 4. Simuler quelques complétions pour les formations passées
      await this.simulateTrainingCompletions()
      console.log(`🎓 Certifications simulées`)

      // 5. Générer le rapport
      const report = await this.generateComplianceReport()
      console.log(`📈 Conformité globale: ${report.summary.overallCompliance}%`)
      console.log(`⚠️ ${report.urgentActions.length} actions urgentes identifiées`)

      console.log('✅ Système de formation HSE initialisé avec succès !')
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error)
      throw error
    }
  }
}

export const hseTrainingImporter = new HSETrainingImporterService()
