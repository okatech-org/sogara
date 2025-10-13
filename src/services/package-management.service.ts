import { aiExtractionService } from './ai-extraction.service'

export interface PackageItem {
  id: string
  trackingNumber: string
  barcode?: string

  senderName: string
  senderOrganization?: string
  senderAddress?: string
  senderContact?: string

  recipientName: string
  recipientDepartment: string
  recipientContact?: string
  recipientFloor?: string
  recipientOffice?: string

  category: 'standard' | 'fragile' | 'valuable' | 'confidential' | 'medical'
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }

  status: 'reception' | 'stockage' | 'en_attente_retrait' | 'livre' | 'retourne'
  priority: 'normal' | 'urgent' | 'immediate'
  storageLocation?: string

  receivedDate: string
  expectedPickup?: string
  deliveredDate?: string

  signatureRequired: boolean
  signatureReceived?: string
  signedBy?: string
  photoProof?: string

  notificationSent: boolean
  notificationDate?: string
  reminderCount: number

  attachedDocuments?: string[]
  photos?: string[]

  aiScanned?: boolean
  ocrData?: any
  autoClassified?: boolean

  receivedBy: string
  notes?: string
  incidentReports?: string[]
}

export class PackageManagementService {
  private packages: PackageItem[] = []
  private readonly STORAGE_KEY = 'sogara_packages_ai'

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.packages = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erreur chargement colis:', error)
      this.packages = []
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.packages))
    } catch (error) {
      console.error('Erreur sauvegarde colis:', error)
    }
  }

  async registerPackageWithAI(
    imageData: string | File,
    additionalInfo?: Partial<PackageItem>,
  ): Promise<PackageItem> {
    const extractionResult = await aiExtractionService.extractPackageLabel(imageData, {
      extractBarcode: true,
      extractAddress: true,
      extractDimensions: true,
    })

    if (!extractionResult.success) {
      throw new Error("Échec de l'extraction de l'étiquette")
    }

    const packageId = this.generatePackageId()
    const trackingNumber = extractionResult.data.trackingNumber || this.generateTrackingNumber()

    const pkg: PackageItem = {
      id: packageId,
      trackingNumber,
      barcode: extractionResult.data.barcode,

      senderName: extractionResult.data.sender?.name || additionalInfo?.senderName || '',
      senderOrganization:
        extractionResult.data.sender?.organization || additionalInfo?.senderOrganization,
      senderAddress: extractionResult.data.sender?.address || additionalInfo?.senderAddress,
      senderContact: extractionResult.data.sender?.phone || additionalInfo?.senderContact,

      recipientName: extractionResult.data.recipient?.name || additionalInfo?.recipientName || '',
      recipientDepartment:
        extractionResult.data.recipient?.department || additionalInfo?.recipientDepartment || '',
      recipientContact: additionalInfo?.recipientContact,
      recipientFloor: extractionResult.data.recipient?.floor || additionalInfo?.recipientFloor,
      recipientOffice: extractionResult.data.recipient?.office || additionalInfo?.recipientOffice,

      category: this.determineCategory(extractionResult.data.packageCategory) || 'standard',
      weight: this.parseWeight(extractionResult.data.weight),
      dimensions: this.parseDimensions(extractionResult.data.dimensions),

      status: 'reception',
      priority: this.determinePriority(extractionResult.data),
      storageLocation: this.assignStorageLocation(extractionResult.data.packageCategory),

      receivedDate: new Date().toISOString(),
      expectedPickup: this.calculateExpectedPickup(additionalInfo?.priority),

      signatureRequired:
        additionalInfo?.signatureRequired ||
        this.requiresSignature(extractionResult.data.packageCategory),

      notificationSent: false,
      reminderCount: 0,

      aiScanned: true,
      ocrData: extractionResult.data,
      autoClassified: true,

      receivedBy: additionalInfo?.receivedBy || 'system',
      notes: additionalInfo?.notes || extractionResult.data.specialInstructions,
    }

    this.packages.push(pkg)
    this.saveToStorage()

    await this.notifyRecipient(pkg)

    if (pkg.priority === 'urgent' || pkg.category === 'fragile') {
      this.notifySpecialPackage(pkg)
    }

    return pkg
  }

  async updatePackageStatus(
    packageId: string,
    status: PackageItem['status'],
    additionalInfo?: {
      storageLocation?: string
      signedBy?: string
      signature?: string
      photoProof?: string
    },
  ): Promise<void> {
    const index = this.packages.findIndex(p => p.id === packageId)
    if (index === -1) throw new Error('Colis non trouvé')

    this.packages[index].status = status

    if (status === 'stockage' && additionalInfo?.storageLocation) {
      this.packages[index].storageLocation = additionalInfo.storageLocation
    }

    if (status === 'livre') {
      this.packages[index].deliveredDate = new Date().toISOString()
      if (additionalInfo?.signedBy) this.packages[index].signedBy = additionalInfo.signedBy
      if (additionalInfo?.signature)
        this.packages[index].signatureReceived = additionalInfo.signature
      if (additionalInfo?.photoProof) this.packages[index].photoProof = additionalInfo.photoProof
    }

    this.saveToStorage()
  }

  async notifyRecipient(pkg: PackageItem): Promise<void> {
    const index = this.packages.findIndex(p => p.id === pkg.id)
    if (index === -1) return

    this.packages[index].notificationSent = true
    this.packages[index].notificationDate = new Date().toISOString()
    this.saveToStorage()

    console.log(`Notification envoyée pour le colis ${pkg.trackingNumber}`)
  }

  async sendReminder(packageId: string): Promise<void> {
    const index = this.packages.findIndex(p => p.id === packageId)
    if (index === -1) throw new Error('Colis non trouvé')

    this.packages[index].reminderCount++
    this.saveToStorage()

    console.log(
      `Rappel ${this.packages[index].reminderCount} envoyé pour le colis ${this.packages[index].trackingNumber}`,
    )
  }

  getPackagesByStatus(status?: PackageItem['status']): PackageItem[] {
    if (status) {
      return this.packages.filter(p => p.status === status)
    }
    return this.packages
  }

  getAll(): PackageItem[] {
    return this.packages
  }

  getPackageStats() {
    const today = new Date().toDateString()

    return {
      total: this.packages.length,
      enReception: this.packages.filter(p => p.status === 'reception').length,
      enStockage: this.packages.filter(p => p.status === 'stockage').length,
      enAttente: this.packages.filter(p => p.status === 'en_attente_retrait').length,
      livres: this.packages.filter(p => p.status === 'livre').length,
      recusAujourdhui: this.packages.filter(p => new Date(p.receivedDate).toDateString() === today)
        .length,
      urgents: this.packages.filter(p => p.priority === 'urgent' && p.status !== 'livre').length,
      fragiles: this.packages.filter(p => p.category === 'fragile').length,
      parDepartement: this.groupPackagesByDepartment(),
      parCategorie: this.groupPackagesByCategory(),
      parEmplacement: this.groupPackagesByLocation(),
    }
  }

  private generatePackageId(): string {
    return `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateTrackingNumber(): string {
    return `GA${Date.now()}${Math.floor(Math.random() * 1000)}`
  }

  private determineCategory(category?: string): PackageItem['category'] {
    const cat = category?.toLowerCase()

    if (cat?.includes('fragile')) return 'fragile'
    if (cat?.includes('valuable') || cat?.includes('valeur')) return 'valuable'
    if (cat?.includes('confidentiel')) return 'confidential'
    if (cat?.includes('medical')) return 'medical'

    return 'standard'
  }

  private determinePriority(data: any): PackageItem['priority'] {
    if (data.specialInstructions?.toLowerCase().includes('urgent')) {
      return 'urgent'
    }
    if (data.specialInstructions?.toLowerCase().includes('immediate')) {
      return 'immediate'
    }
    return 'normal'
  }

  private requiresSignature(category?: string): boolean {
    const signatureRequired = ['valuable', 'confidential', 'medical']
    return signatureRequired.includes(category || 'standard')
  }

  private assignStorageLocation(category?: string): string {
    const locations: Record<string, string> = {
      fragile: 'Zone A - Étagère sécurisée',
      valuable: 'Coffre-fort',
      confidential: 'Armoire verrouillée',
      medical: 'Zone réfrigérée',
      standard: 'Zone B - Étagère standard',
    }

    return locations[category || 'standard'] || 'Zone B - Étagère standard'
  }

  private parseWeight(weightStr?: string): number | undefined {
    if (!weightStr) return undefined

    const match = weightStr.match(/(\d+\.?\d*)/)
    return match ? parseFloat(match[1]) : undefined
  }

  private parseDimensions(dimensionsStr?: string): PackageItem['dimensions'] | undefined {
    if (!dimensionsStr) return undefined

    const match = dimensionsStr.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/)
    if (!match) return undefined

    return {
      length: parseInt(match[1]),
      width: parseInt(match[2]),
      height: parseInt(match[3]),
    }
  }

  private calculateExpectedPickup(priority?: string): string {
    const now = new Date()
    const days = priority === 'urgent' ? 1 : priority === 'immediate' ? 0 : 3
    now.setDate(now.getDate() + days)
    return now.toISOString()
  }

  private groupPackagesByDepartment(): Record<string, number> {
    return this.packages.reduce(
      (acc, pkg) => {
        acc[pkg.recipientDepartment] = (acc[pkg.recipientDepartment] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private groupPackagesByCategory(): Record<string, number> {
    return this.packages.reduce(
      (acc, pkg) => {
        acc[pkg.category] = (acc[pkg.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private groupPackagesByLocation(): Record<string, number> {
    return this.packages.reduce(
      (acc, pkg) => {
        if (pkg.storageLocation) {
          acc[pkg.storageLocation] = (acc[pkg.storageLocation] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private notifySpecialPackage(pkg: PackageItem): void {
    console.warn('Colis spécial reçu:', pkg.trackingNumber, pkg.category, pkg.priority)
  }
}

export const packageService = new PackageManagementService()
