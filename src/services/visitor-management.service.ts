import { aiExtractionService } from './ai-extraction.service'

export interface VisitorExtended {
  id: string
  badgeNumber: string

  firstName: string
  lastName: string
  phone: string
  email?: string
  company?: string
  idType: 'CNI' | 'passeport' | 'permis' | 'autre'
  idNumber: string
  nationality: string
  photo?: string
  birthDate?: string

  purposeOfVisit: string
  serviceRequested: string
  employeeToVisit: string
  department: string
  appointmentRef?: string
  expectedDuration: string
  urgencyLevel: 'normal' | 'high' | 'vip'

  accessMode: 'libre' | 'badge' | 'escorte'
  accessZones: string[]
  securityLevel: 'standard' | 'elevated' | 'maximum'

  hasKeptItems: boolean
  keptItems?: string[]

  checkInTime: string
  checkOutTime?: string
  duration?: string
  expectedCheckOut?: string

  status: 'present' | 'completed' | 'overdue' | 'emergency_exit'
  lastSeen: string
  location: string

  qrCode: string
  issuedBy: string

  satisfaction?: number
  notes?: string

  aiExtracted?: boolean
  aiConfidence?: number
  requiresVerification?: boolean
  extractionWarnings?: string[]
}

export class VisitorManagementService {
  private visitors: VisitorExtended[] = []
  private readonly STORAGE_KEY = 'sogara_visitors_ai'

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.visitors = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erreur chargement visiteurs:', error)
      this.visitors = []
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.visitors))
    } catch (error) {
      console.error('Erreur sauvegarde visiteurs:', error)
    }
  }

  async registerVisitorWithAI(
    imageData: string | File,
    additionalInfo?: Partial<VisitorExtended>,
  ): Promise<VisitorExtended> {
    const extractionResult = await aiExtractionService.extractIdentityDocument(imageData)

    if (!extractionResult.success) {
      throw new Error("Échec de l'extraction du document")
    }

    const visitorId = this.generateVisitorId()
    const badgeNumber = this.generateBadgeNumber()
    const qrCode = await this.generateQRCode(visitorId, badgeNumber)

    const visitor: VisitorExtended = {
      id: visitorId,
      badgeNumber,

      firstName: extractionResult.data.firstName || additionalInfo?.firstName || '',
      lastName: extractionResult.data.lastName || additionalInfo?.lastName || '',
      idType: extractionResult.data.idType || 'CNI',
      idNumber:
        extractionResult.data.idNumber ||
        extractionResult.data.passportNumber ||
        extractionResult.data.licenseNumber ||
        '',
      nationality: extractionResult.data.nationality || 'Gabonaise',
      birthDate: extractionResult.data.birthDate,

      phone: additionalInfo?.phone || '',
      email: additionalInfo?.email,
      company: additionalInfo?.company,

      purposeOfVisit: additionalInfo?.purposeOfVisit || '',
      serviceRequested: additionalInfo?.serviceRequested || '',
      employeeToVisit: additionalInfo?.employeeToVisit || '',
      department: additionalInfo?.department || '',
      expectedDuration: additionalInfo?.expectedDuration || '1h',
      urgencyLevel: additionalInfo?.urgencyLevel || 'normal',

      accessMode: additionalInfo?.accessMode || 'badge',
      accessZones: additionalInfo?.accessZones || ['reception', 'hall'],
      securityLevel: additionalInfo?.securityLevel || 'standard',

      hasKeptItems: false,
      keptItems: [],

      checkInTime: new Date().toISOString(),
      expectedCheckOut: this.calculateExpectedCheckOut(additionalInfo?.expectedDuration || '1h'),

      status: 'present',
      lastSeen: new Date().toISOString(),
      location: 'reception',

      qrCode,
      issuedBy: additionalInfo?.issuedBy || 'system',

      aiExtracted: true,
      aiConfidence: extractionResult.confidence,
      requiresVerification: extractionResult.requiresVerification,
      extractionWarnings: extractionResult.warnings,
    }

    this.visitors.push(visitor)
    this.saveToStorage()

    if (visitor.requiresVerification) {
      this.notifyVerificationRequired(visitor)
    }

    return visitor
  }

  async checkOutVisitor(
    visitorId: string,
    feedback?: {
      satisfaction?: number
      notes?: string
    },
  ): Promise<void> {
    const index = this.visitors.findIndex(v => v.id === visitorId)
    if (index === -1) throw new Error('Visiteur non trouvé')

    const checkInTime = new Date(this.visitors[index].checkInTime)
    const checkOutTime = new Date()
    const duration = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000 / 60)

    this.visitors[index].checkOutTime = checkOutTime.toISOString()
    this.visitors[index].duration = `${duration} min`
    this.visitors[index].status = 'completed'

    if (feedback) {
      this.visitors[index].satisfaction = feedback.satisfaction
      this.visitors[index].notes = feedback.notes
    }

    this.saveToStorage()
  }

  getActiveVisitors(): VisitorExtended[] {
    return this.visitors
      .filter(v => v.status === 'present')
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
  }

  getAll(): VisitorExtended[] {
    return this.visitors
  }

  getOverdueVisitors(): VisitorExtended[] {
    const now = new Date()
    return this.visitors.filter(v => {
      if (v.status !== 'present' || !v.expectedCheckOut) return false
      return new Date(v.expectedCheckOut) < now
    })
  }

  getVisitorStats() {
    const today = new Date().toDateString()

    return {
      total: this.visitors.length,
      present: this.visitors.filter(v => v.status === 'present').length,
      todayVisitors: this.visitors.filter(v => new Date(v.checkInTime).toDateString() === today)
        .length,
      overdue: this.getOverdueVisitors().length,
      vip: this.visitors.filter(v => v.urgencyLevel === 'vip').length,
      aiExtracted: this.visitors.filter(v => v.aiExtracted).length,
      averageDuration: this.calculateAverageDuration(),
      byDepartment: this.groupByDepartment(),
      byAccessMode: this.groupByAccessMode(),
    }
  }

  private generateVisitorId(): string {
    return `VIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateBadgeNumber(): string {
    return `B${new Date().getFullYear()}${String(Date.now()).slice(-6)}`
  }

  private async generateQRCode(visitorId: string, badgeNumber: string): Promise<string> {
    const data = JSON.stringify({
      id: visitorId,
      badge: badgeNumber,
      timestamp: Date.now(),
    })

    return `data:image/svg+xml;base64,${btoa(data)}`
  }

  private calculateExpectedCheckOut(duration: string): string {
    const now = new Date()
    const hours = parseInt(duration) || 1
    now.setHours(now.getHours() + hours)
    return now.toISOString()
  }

  private calculateAverageDuration(): number {
    const completedVisits = this.visitors.filter(v => v.duration)
    if (completedVisits.length === 0) return 0

    const totalMinutes = completedVisits.reduce((sum, v) => {
      const minutes = parseInt(v.duration || '0')
      return sum + minutes
    }, 0)

    return Math.round(totalMinutes / completedVisits.length)
  }

  private groupByDepartment(): Record<string, number> {
    return this.visitors.reduce(
      (acc, v) => {
        acc[v.department] = (acc[v.department] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private groupByAccessMode(): Record<string, number> {
    return this.visitors.reduce(
      (acc, v) => {
        acc[v.accessMode] = (acc[v.accessMode] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private notifyVerificationRequired(visitor: VisitorExtended): void {
    console.warn('Vérification requise pour le visiteur:', visitor.id)
  }
}

export const visitorService = new VisitorManagementService()
