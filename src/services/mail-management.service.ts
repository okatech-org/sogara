import { aiExtractionService, ExtractionResult } from './ai-extraction.service';

export interface Mail {
  id: string;
  referenceNumber: string;
  
  senderName: string;
  senderOrganization?: string;
  senderAddress?: string;
  
  recipientName: string;
  recipientDepartment: string;
  recipientEmail?: string;
  recipientService?: string;
  
  type: 'lettre' | 'document' | 'facture' | 'contrat' | 'administratif' | 'autre';
  confidentiality: 'normal' | 'confidentiel' | 'tres_confidentiel';
  urgency: 'normal' | 'urgent' | 'tres_urgent';
  
  scanned: boolean;
  scanDate?: string;
  scanQuality?: 'basse' | 'moyenne' | 'haute';
  ocrProcessed: boolean;
  ocrContent?: string;
  documentUrl?: string;
  pages?: number;
  
  status: 'recu' | 'scanne' | 'envoye' | 'lu' | 'archive';
  distributionMethod: 'email' | 'physique' | 'les_deux';
  emailSentDate?: string;
  emailOpened?: boolean;
  physicalDeliveryDate?: string;
  
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  requiresResponse: boolean;
  responseDeadline?: string;
  responseReceived?: boolean;
  
  autoClassified: boolean;
  suggestedCategory?: string;
  keywords?: string[];
  summary?: string;
  
  archiveRequired: boolean;
  archiveDate?: string;
  archiveReference?: string;
  retentionPeriod?: string;
  
  aiExtracted?: boolean;
  aiConfidence?: number;
  extractedData?: any;
  
  receivedDate: string;
  receivedBy: string;
  notes?: string;
  tags?: string[];
  relatedDocuments?: string[];
}

export class MailManagementService {
  private mails: Mail[] = [];
  private readonly STORAGE_KEY = 'sogara_mails';
  
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.mails = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur chargement courriers:', error);
      this.mails = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mails));
    } catch (error) {
      console.error('Erreur sauvegarde courriers:', error);
    }
  }

  async registerMailWithAI(
    imageData: string | File,
    additionalInfo?: Partial<Mail>
  ): Promise<Mail> {
    const extractionResult = await aiExtractionService.extractMailDocument(imageData, {
      extractFullText: true,
      generateSummary: true,
      classifyContent: true,
      detectKeywords: true
    });
    
    if (!extractionResult.success) {
      throw new Error('Échec de l\'extraction du courrier');
    }
    
    const mailId = this.generateMailId();
    const referenceNumber = this.generateReferenceNumber();
    
    const mail: Mail = {
      id: mailId,
      referenceNumber,
      
      senderName: extractionResult.data.sender?.name || additionalInfo?.senderName || '',
      senderOrganization: extractionResult.data.sender?.organization || additionalInfo?.senderOrganization,
      senderAddress: extractionResult.data.sender?.address || additionalInfo?.senderAddress,
      
      recipientName: extractionResult.data.recipient?.name || additionalInfo?.recipientName || '',
      recipientDepartment: extractionResult.data.recipient?.department || additionalInfo?.recipientDepartment || '',
      recipientEmail: additionalInfo?.recipientEmail,
      recipientService: extractionResult.data.recipient?.service || additionalInfo?.recipientService,
      
      type: this.determineMailType(extractionResult.data.documentType) || 'lettre',
      confidentiality: extractionResult.data.confidentiality || 'normal',
      urgency: extractionResult.data.urgency || 'normal',
      
      scanned: true,
      scanDate: new Date().toISOString(),
      scanQuality: 'haute',
      ocrProcessed: true,
      ocrContent: extractionResult.data.fullText,
      documentUrl: await this.uploadDocument(imageData),
      pages: 1,
      
      status: 'scanne',
      distributionMethod: additionalInfo?.distributionMethod || 'email',
      
      autoClassified: true,
      suggestedCategory: extractionResult.data.suggestedCategory,
      keywords: extractionResult.data.keywords,
      summary: extractionResult.data.summary,
      
      requiresResponse: additionalInfo?.requiresResponse || false,
      responseDeadline: additionalInfo?.responseDeadline,
      
      archiveRequired: this.shouldArchive(extractionResult.data.documentType),
      retentionPeriod: this.getRetentionPeriod(extractionResult.data.documentType),
      
      aiExtracted: true,
      aiConfidence: extractionResult.confidence,
      extractedData: extractionResult.data,
      
      receivedDate: new Date().toISOString(),
      receivedBy: additionalInfo?.receivedBy || 'system',
      notes: additionalInfo?.notes,
      tags: extractionResult.data.keywords
    };
    
    this.mails.push(mail);
    this.saveToStorage();
    
    if (mail.confidentiality === 'normal' && mail.recipientEmail) {
      await this.sendMailToRecipient(mail);
    }
    
    if (mail.urgency === 'urgent' || mail.urgency === 'tres_urgent') {
      this.notifyUrgentMail(mail);
    }
    
    return mail;
  }

  async sendMailToRecipient(mail: Mail): Promise<void> {
    const index = this.mails.findIndex(m => m.id === mail.id);
    if (index === -1) return;
    
    this.mails[index].emailSentDate = new Date().toISOString();
    this.mails[index].status = 'envoye';
    this.saveToStorage();
    
    console.log(`Courrier ${mail.referenceNumber} envoyé à ${mail.recipientEmail}`);
  }

  async markAsRead(mailId: string, readBy: string): Promise<void> {
    const index = this.mails.findIndex(m => m.id === mailId);
    if (index === -1) throw new Error('Courrier non trouvé');
    
    this.mails[index].status = 'lu';
    this.mails[index].acknowledgedBy = readBy;
    this.mails[index].acknowledgedDate = new Date().toISOString();
    this.mails[index].emailOpened = true;
    this.saveToStorage();
  }

  async archiveMail(mailId: string): Promise<void> {
    const index = this.mails.findIndex(m => m.id === mailId);
    if (index === -1) throw new Error('Courrier non trouvé');
    
    this.mails[index].status = 'archive';
    this.mails[index].archiveDate = new Date().toISOString();
    this.mails[index].archiveReference = this.generateArchiveReference();
    this.saveToStorage();
  }

  searchMails(query: string): Mail[] {
    const searchTerm = query.toLowerCase();
    
    return this.mails.filter(mail => 
      mail.referenceNumber.toLowerCase().includes(searchTerm) ||
      mail.senderName.toLowerCase().includes(searchTerm) ||
      mail.recipientName.toLowerCase().includes(searchTerm) ||
      mail.keywords?.some(k => k.toLowerCase().includes(searchTerm)) ||
      mail.summary?.toLowerCase().includes(searchTerm)
    );
  }

  getMailsByStatus(status?: Mail['status']): Mail[] {
    if (status) {
      return this.mails.filter(m => m.status === status);
    }
    return this.mails;
  }

  getAll(): Mail[] {
    return this.mails;
  }

  getMailStats() {
    const today = new Date().toDateString();
    
    return {
      total: this.mails.length,
      nonLus: this.mails.filter(m => m.status === 'scanne' || m.status === 'envoye').length,
      urgents: this.mails.filter(m => 
        (m.urgency === 'urgent' || m.urgency === 'tres_urgent') && 
        m.status !== 'archive'
      ).length,
      aTraiter: this.mails.filter(m => m.requiresResponse && !m.responseReceived).length,
      scannesAujourdhui: this.mails.filter(m => 
        m.scanDate && new Date(m.scanDate).toDateString() === today
      ).length,
      parDepartement: this.groupMailsByDepartment(),
      parType: this.groupMailsByType(),
      parConfidentialite: this.groupMailsByConfidentiality()
    };
  }

  private generateMailId(): string {
    return `MAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CR-${year}-${sequence}`;
  }

  private generateArchiveReference(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ARCH-${year}-${month}-${sequence}`;
  }

  private determineMailType(documentType?: string): Mail['type'] {
    const type = documentType?.toLowerCase();
    
    if (type?.includes('facture')) return 'facture';
    if (type?.includes('contrat')) return 'contrat';
    if (type?.includes('administratif')) return 'administratif';
    if (type?.includes('document')) return 'document';
    
    return 'lettre';
  }

  private shouldArchive(documentType?: string): boolean {
    const importantTypes = ['contrat', 'facture', 'administratif'];
    return importantTypes.includes(documentType || '');
  }

  private getRetentionPeriod(documentType?: string): string {
    const retentionPeriods: Record<string, string> = {
      'contrat': '10 ans',
      'facture': '5 ans',
      'administratif': '5 ans',
      'document': '3 ans',
      'lettre': '1 an'
    };
    
    return retentionPeriods[documentType || 'lettre'] || '1 an';
  }

  private async uploadDocument(imageData: string | File): Promise<string> {
    if (typeof imageData === 'string') {
      return imageData;
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(imageData);
    });
  }

  private groupMailsByDepartment(): Record<string, number> {
    return this.mails.reduce((acc, mail) => {
      acc[mail.recipientDepartment] = (acc[mail.recipientDepartment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupMailsByType(): Record<string, number> {
    return this.mails.reduce((acc, mail) => {
      acc[mail.type] = (acc[mail.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupMailsByConfidentiality(): Record<string, number> {
    return this.mails.reduce((acc, mail) => {
      acc[mail.confidentiality] = (acc[mail.confidentiality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private notifyUrgentMail(mail: Mail): void {
    console.warn('Courrier urgent reçu:', mail.referenceNumber);
  }
}

export const mailService = new MailManagementService();

