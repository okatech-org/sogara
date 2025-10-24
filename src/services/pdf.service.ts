import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  author: string;
  company: string;
  sections: ReportSection[];
  summary?: string;
  footer?: string;
}

export interface ReportSection {
  title: string;
  content: string | string[];
  type: 'text' | 'list' | 'table' | 'chart';
  data?: any;
}

export interface StrategicReportData extends ReportData {
  kpis: {
    operationalEfficiency: number;
    hseCompliance: number;
    hrProductivity: number;
    costOptimization: number;
  };
  incidents: {
    total: number;
    critical: number;
    resolved: number;
    pending: number;
  };
  employees: {
    total: number;
    active: number;
    onLeave: number;
    newHires: number;
  };
  visits: {
    total: number;
    thisMonth: number;
    pending: number;
  };
  equipment: {
    total: number;
    operational: number;
    maintenance: number;
    outOfService: number;
  };
}

export class PDFReportService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Génère un rapport stratégique complet
   */
  async generateStrategicReport(data: StrategicReportData): Promise<Blob> {
    this.doc = new jsPDF();
    this.currentY = 20;

    // En-tête
    this.addHeader(data);
    
    // Résumé exécutif
    this.addExecutiveSummary(data);
    
    // KPIs
    this.addKPIsSection(data.kpis);
    
    // Incidents
    this.addIncidentsSection(data.incidents);
    
    // RH
    this.addHRSection(data.employees);
    
    // Visites
    this.addVisitsSection(data.visits);
    
    // Équipements
    this.addEquipmentSection(data.equipment);
    
    // Pied de page
    this.addFooter(data);

    return this.doc.output('blob');
  }

  /**
   * Génère un rapport d'incidents HSE
   */
  async generateHSEIncidentsReport(data: any): Promise<Blob> {
    this.doc = new jsPDF();
    this.currentY = 20;

    this.addHeader({
      title: 'Rapport Incidents HSE',
      subtitle: 'Analyse des incidents et actions correctives',
      date: new Date().toLocaleDateString('fr-FR'),
      author: 'Direction Générale',
      company: 'SOGARA',
      sections: []
    });

    this.addIncidentsDetails(data);
    this.addFooter({ title: 'Rapport Incidents HSE', date: new Date().toLocaleDateString('fr-FR'), author: 'Direction Générale', company: 'SOGARA', sections: [] });

    return this.doc.output('blob');
  }

  /**
   * Génère un rapport de conformité
   */
  async generateComplianceReport(data: any): Promise<Blob> {
    this.doc = new jsPDF();
    this.currentY = 20;

    this.addHeader({
      title: 'Rapport de Conformité',
      subtitle: 'État de la conformité réglementaire',
      date: new Date().toLocaleDateString('fr-FR'),
      author: 'Direction Générale',
      company: 'SOGARA',
      sections: []
    });

    this.addComplianceDetails(data);
    this.addFooter({ title: 'Rapport de Conformité', date: new Date().toLocaleDateString('fr-FR'), author: 'Direction Générale', company: 'SOGARA', sections: [] });

    return this.doc.output('blob');
  }

  private addHeader(data: ReportData) {
    // Logo et titre
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.title, this.margin, this.currentY);
    this.currentY += 10;

    if (data.subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.subtitle, this.margin, this.currentY);
      this.currentY += 8;
    }

    // Informations du rapport
    this.doc.setFontSize(10);
    this.doc.text(`Date: ${data.date}`, this.margin, this.currentY);
    this.doc.text(`Auteur: ${data.author}`, this.margin + 80, this.currentY);
    this.doc.text(`Entreprise: ${data.company}`, this.margin + 160, this.currentY);
    this.currentY += 15;

    // Ligne de séparation
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  private addExecutiveSummary(data: StrategicReportData) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Résumé Exécutif', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const summary = data.summary || `Rapport de direction générale pour ${data.date}. 
    Ce rapport présente une vue d'ensemble des performances opérationnelles, 
    de la conformité HSE, des ressources humaines et des opérations de l'entreprise.`;
    
    const lines = this.doc.splitTextToSize(summary, 170);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 5 + 10;
  }

  private addKPIsSection(kpis: StrategicReportData['kpis']) {
    this.addSectionTitle('Indicateurs de Performance Clés (KPIs)');
    
    const kpiData = [
      ['KPI', 'Valeur', 'Statut'],
      ['Efficacité Opérationnelle', `${kpis.operationalEfficiency}%`, this.getStatusText(kpis.operationalEfficiency)],
      ['Conformité HSE', `${kpis.hseCompliance}%`, this.getStatusText(kpis.hseCompliance)],
      ['Productivité RH', `${kpis.hrProductivity}%`, this.getStatusText(kpis.hrProductivity)],
      ['Optimisation Coûts', `${kpis.costOptimization}%`, this.getStatusText(kpis.costOptimization)]
    ];

    this.addTable(kpiData);
  }

  private addIncidentsSection(incidents: StrategicReportData['incidents']) {
    this.addSectionTitle('Incidents HSE');
    
    const incidentData = [
      ['Métrique', 'Valeur'],
      ['Total Incidents', incidents.total.toString()],
      ['Incidents Critiques', incidents.critical.toString()],
      ['Incidents Résolus', incidents.resolved.toString()],
      ['En Attente', incidents.pending.toString()]
    ];

    this.addTable(incidentData);
  }

  private addHRSection(employees: StrategicReportData['employees']) {
    this.addSectionTitle('Ressources Humaines');
    
    const hrData = [
      ['Métrique', 'Valeur'],
      ['Total Employés', employees.total.toString()],
      ['Employés Actifs', employees.active.toString()],
      ['En Congé', employees.onLeave.toString()],
      ['Nouveaux Recrutements', employees.newHires.toString()]
    ];

    this.addTable(hrData);
  }

  private addVisitsSection(visits: StrategicReportData['visits']) {
    this.addSectionTitle('Visites');
    
    const visitData = [
      ['Métrique', 'Valeur'],
      ['Total Visites', visits.total.toString()],
      ['Ce Mois', visits.thisMonth.toString()],
      ['En Attente', visits.pending.toString()]
    ];

    this.addTable(visitData);
  }

  private addEquipmentSection(equipment: StrategicReportData['equipment']) {
    this.addSectionTitle('Équipements');
    
    const equipmentData = [
      ['Métrique', 'Valeur'],
      ['Total Équipements', equipment.total.toString()],
      ['Opérationnels', equipment.operational.toString()],
      ['En Maintenance', equipment.maintenance.toString()],
      ['Hors Service', equipment.outOfService.toString()]
    ];

    this.addTable(equipmentData);
  }

  private addIncidentsDetails(data: any) {
    this.addSectionTitle('Détails des Incidents');
    
    // Simulation de données d'incidents
    const incidents = data.incidents || [
      { id: 'INC-001', type: 'Sécurité', severity: 'Critique', status: 'En cours' },
      { id: 'INC-002', type: 'Environnement', severity: 'Moyen', status: 'Résolu' }
    ];

    const incidentData = [
      ['ID', 'Type', 'Sévérité', 'Statut'],
      ...incidents.map((incident: any) => [
        incident.id,
        incident.type,
        incident.severity,
        incident.status
      ])
    ];

    this.addTable(incidentData);
  }

  private addComplianceDetails(data: any) {
    this.addSectionTitle('État de la Conformité');
    
    const complianceData = [
      ['Domaine', 'Statut', 'Dernière Vérification'],
      ['Sécurité', 'Conforme', '15/10/2025'],
      ['Environnement', 'Conforme', '10/10/2025'],
      ['Qualité', 'En cours', '20/10/2025']
    ];

    this.addTable(complianceData);
  }

  private addSectionTitle(title: string) {
    if (this.currentY > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addTable(data: string[][]) {
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    const startY = this.currentY;
    const cellHeight = 8;
    const cellWidth = 170 / data[0].length;

    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = this.margin + (colIndex * cellWidth);
        const y = startY + (rowIndex * cellHeight);
        
        // Dessiner la bordure
        this.doc.rect(x, y - cellHeight, cellWidth, cellHeight);
        
        // Ajouter le texte
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
        this.doc.text(cell, x + 2, y - 2);
      });
    });

    this.currentY = startY + (data.length * cellHeight) + 10;
  }

  private addFooter(data: ReportData) {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Page ${i} sur ${pageCount}`, this.margin, 290);
      this.doc.text(`Généré le ${data.date}`, 190 - this.doc.getTextWidth(`Généré le ${data.date}`), 290);
    }
  }

  private getStatusText(value: number): string {
    if (value >= 90) return 'Excellent';
    if (value >= 80) return 'Bon';
    if (value >= 70) return 'Moyen';
    return 'À améliorer';
  }
}

// Instance singleton
export const pdfReportService = new PDFReportService();
