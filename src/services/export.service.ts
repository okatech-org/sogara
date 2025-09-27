import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Employee, Visit, PackageMail, Equipment, HSEIncident, HSETraining } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour les templates de rapport
interface ReportTemplate {
  title: string;
  subtitle?: string;
  author?: string;
  logo?: string;
  footerText?: string;
}

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  formatter?: (value: any) => string;
}

interface ExportOptions {
  filename?: string;
  template?: ReportTemplate;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
}

class ExportService {
  private defaultTemplate: ReportTemplate = {
    title: 'SOGARA Access',
    subtitle: 'Système de Gestion Intégré',
    author: 'SOGARA - Raffinerie',
    footerText: 'Document généré automatiquement'
  };

  /**
   * Exporter des données vers PDF
   */
  async exportToPDF<T>(
    data: T[], 
    columns: ExportColumn[], 
    options: ExportOptions = {}
  ): Promise<Blob> {
    const template = { ...this.defaultTemplate, ...options.template };
    const orientation = options.orientation || 'portrait';
    const pageSize = options.pageSize || 'a4';

    // Créer le document PDF
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    });

    // Configuration des polices (support Unicode)
    doc.setFont('helvetica');

    // En-tête du document
    this.addPDFHeader(doc, template);

    // Préparer les données pour la table
    const tableData = data.map(item => 
      columns.map(col => {
        const value = this.getNestedValue(item, col.key);
        return col.formatter ? col.formatter(value) : String(value || '');
      })
    );

    const tableHeaders = columns.map(col => col.header);

    // Ajouter la table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: this.generateColumnStyles(columns),
      didDrawPage: (data) => {
        // Pied de page
        this.addPDFFooter(doc, template, data.pageNumber, data.pageCount);
      }
    });

    // Retourner le blob
    const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
    
    return pdfBlob;
  }

  /**
   * Exporter des données vers Excel
   */
  async exportToExcel<T>(
    data: T[], 
    columns: ExportColumn[], 
    options: ExportOptions = {}
  ): Promise<Blob> {
    // Préparer les données
    const excelData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        const value = this.getNestedValue(item, col.key);
        row[col.header] = col.formatter ? col.formatter(value) : value;
      });
      return row;
    });

    // Créer le workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Définir la largeur des colonnes
    const columnWidths = columns.map(col => ({ 
      wch: col.width || 15 
    }));
    worksheet['!cols'] = columnWidths;

    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');

    // Ajouter une feuille de métadonnées
    const metaData = [
      ['Titre', options.template?.title || this.defaultTemplate.title],
      ['Généré le', format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })],
      ['Nombre d\'enregistrements', data.length.toString()],
      ['Auteur', options.template?.author || this.defaultTemplate.author]
    ];
    
    const metaWorksheet = XLSX.utils.aoa_to_sheet(metaData);
    XLSX.utils.book_append_sheet(workbook, metaWorksheet, 'Métadonnées');

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });

    const excelBlob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    return excelBlob;
  }

  /**
   * Générer un rapport d'incidents HSE
   */
  async generateIncidentReport(
    incidents: HSEIncident[], 
    employees: Employee[],
    options: ExportOptions = {}
  ): Promise<Blob> {
    const columns: ExportColumn[] = [
      { header: 'Date', key: 'occurredAt', formatter: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm') },
      { header: 'Type', key: 'type' },
      { header: 'Gravité', key: 'severity', formatter: (sev) => sev === 'high' ? 'Élevé' : sev === 'medium' ? 'Moyen' : 'Faible' },
      { header: 'Employé', key: 'employeeId', formatter: (id) => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
      }},
      { header: 'Localisation', key: 'location' },
      { header: 'Statut', key: 'status', formatter: (status) => 
        status === 'reported' ? 'Signalé' : status === 'investigating' ? 'En cours' : 'Résolu'
      },
      { header: 'Description', key: 'description', width: 40 }
    ];

    return this.exportToPDF(incidents, columns, {
      ...options,
      template: {
        title: 'Rapport d\'Incidents HSE',
        subtitle: `Période: ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
        author: 'Service HSE - SOGARA'
      }
    });
  }

  /**
   * Générer un rapport de formations
   */
  async generateTrainingReport(
    trainings: HSETraining[],
    options: ExportOptions = {}
  ): Promise<Blob> {
    const columns: ExportColumn[] = [
      { header: 'Formation', key: 'title' },
      { header: 'Durée (min)', key: 'duration' },
      { header: 'Validité (mois)', key: 'validityMonths' },
      { header: 'Rôles requis', key: 'requiredForRoles', formatter: (roles) => roles.join(', ') },
      { header: 'Sessions', key: 'sessions', formatter: (sessions) => sessions.length.toString() },
      { header: 'Créée le', key: 'createdAt', formatter: (date) => format(new Date(date), 'dd/MM/yyyy') }
    ];

    return this.exportToPDF(trainings, columns, {
      ...options,
      template: {
        title: 'Rapport de Formations HSE',
        subtitle: `Formations disponibles - ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
        author: 'Service HSE - SOGARA'
      }
    });
  }

  /**
   * Générer un rapport d'employés
   */
  async generateEmployeeReport(
    employees: Employee[],
    options: ExportOptions = {}
  ): Promise<Blob> {
    const columns: ExportColumn[] = [
      { header: 'Matricule', key: 'matricule' },
      { header: 'Nom', key: 'lastName' },
      { header: 'Prénom', key: 'firstName' },
      { header: 'Service', key: 'service' },
      { header: 'Rôles', key: 'roles', formatter: (roles) => roles.join(', ') },
      { header: 'Email', key: 'email' },
      { header: 'Statut', key: 'status', formatter: (status) => status === 'active' ? 'Actif' : 'Inactif' },
      { header: 'Visites reçues', key: 'stats.visitsReceived' },
      { header: 'Formations HSE', key: 'stats.hseTrainingsCompleted' }
    ];

    return this.exportToPDF(employees, columns, {
      ...options,
      template: {
        title: 'Liste du Personnel',
        subtitle: `Effectif SOGARA - ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
        author: 'Service RH - SOGARA'
      }
    });
  }

  /**
   * Télécharger un fichier
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Méthodes utilitaires privées
   */
  private addPDFHeader(doc: jsPDF, template: ReportTemplate): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo (simulé par un rectangle)
    doc.setFillColor(41, 128, 185);
    doc.rect(20, 10, 15, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('SOGARA', 22, 19);
    
    // Titre principal
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(template.title, 45, 20);
    
    // Sous-titre
    if (template.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(template.subtitle, 45, 28);
    }
    
    // Date de génération
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const dateText = `Généré le ${format(new Date(), "dd/MM/yyyy 'à' HH:mm")}`;
    doc.text(dateText, pageWidth - 20, 15, { align: 'right' });
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, pageWidth - 20, 35);
  }

  private addPDFFooter(doc: jsPDF, template: ReportTemplate, pageNumber: number, totalPages: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Texte du pied de page
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    if (template.footerText) {
      doc.text(template.footerText, 20, pageHeight - 10);
    }
    
    // Numéro de page
    const pageText = `Page ${pageNumber} sur ${totalPages}`;
    doc.text(pageText, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }

  private generateColumnStyles(columns: ExportColumn[]): Record<number, any> {
    const styles: Record<number, any> = {};
    
    columns.forEach((col, index) => {
      if (col.width) {
        styles[index] = { cellWidth: col.width };
      }
    });
    
    return styles;
  }

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}

// Instance singleton
export const exportService = new ExportService();

// Fonctions de commodité pour les exports spécifiques

export const exportEmployeesToPDF = (employees: Employee[], filename?: string) => {
  return exportService.generateEmployeeReport(employees, {
    filename: filename || `employes-${format(new Date(), 'yyyy-MM-dd')}.pdf`
  });
};

export const exportEmployeesToExcel = (employees: Employee[], filename?: string) => {
  const columns: ExportColumn[] = [
    { header: 'Matricule', key: 'matricule' },
    { header: 'Nom', key: 'lastName' },
    { header: 'Prénom', key: 'firstName' },
    { header: 'Service', key: 'service' },
    { header: 'Rôles', key: 'roles', formatter: (roles) => roles.join(', ') },
    { header: 'Email', key: 'email' },
    { header: 'Téléphone', key: 'phone' },
    { header: 'Statut', key: 'status' },
    { header: 'Compétences', key: 'competences', formatter: (comp) => comp.join(', ') },
    { header: 'Habilitations', key: 'habilitations', formatter: (hab) => hab.join(', ') },
    { header: 'Visites reçues', key: 'stats.visitsReceived' },
    { header: 'Colis reçus', key: 'stats.packagesReceived' },
    { header: 'Formations HSE', key: 'stats.hseTrainingsCompleted' }
  ];

  return exportService.exportToExcel(employees, columns, {
    filename: filename || `employes-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
  });
};

export const exportVisitsToPDF = (visits: Visit[], visitors: Visitor[], employees: Employee[], filename?: string) => {
  const columns: ExportColumn[] = [
    { header: 'Date', key: 'scheduledAt', formatter: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm') },
    { header: 'Visiteur', key: 'visitorId', formatter: (id) => {
      const visitor = visitors.find(v => v.id === id);
      return visitor ? `${visitor.firstName} ${visitor.lastName}` : 'Inconnu';
    }},
    { header: 'Société', key: 'visitorId', formatter: (id) => {
      const visitor = visitors.find(v => v.id === id);
      return visitor?.company || '';
    }},
    { header: 'Hôte', key: 'hostEmployeeId', formatter: (id) => {
      const emp = employees.find(e => e.id === id);
      return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
    }},
    { header: 'Statut', key: 'status', formatter: (status) => {
      const statusMap = {
        expected: 'Attendu',
        waiting: 'En attente',
        in_progress: 'En cours',
        checked_out: 'Sorti'
      };
      return statusMap[status as keyof typeof statusMap] || status;
    }},
    { header: 'Objet', key: 'purpose', width: 30 },
    { header: 'Badge', key: 'badgeNumber' }
  ];

  return exportService.exportToPDF(visits, columns, {
    filename: filename || `visites-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    template: {
      title: 'Rapport des Visites',
      subtitle: `Registre des visiteurs - ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
      author: 'Service Accueil - SOGARA'
    }
  });
};

export const exportIncidentsToPDF = (incidents: HSEIncident[], employees: Employee[], filename?: string) => {
  return exportService.generateIncidentReport(incidents, employees, {
    filename: filename || `incidents-hse-${format(new Date(), 'yyyy-MM-dd')}.pdf`
  });
};

export const exportEquipmentToPDF = (equipment: Equipment[], employees: Employee[], filename?: string) => {
  const columns: ExportColumn[] = [
    { header: 'Libellé', key: 'label' },
    { header: 'Type', key: 'type' },
    { header: 'N° Série', key: 'serialNumber' },
    { header: 'Statut', key: 'status', formatter: (status) => {
      const statusMap = {
        operational: 'Opérationnel',
        maintenance: 'Maintenance',
        out_of_service: 'Hors service'
      };
      return statusMap[status as keyof typeof statusMap] || status;
    }},
    { header: 'Détenteur', key: 'holderEmployeeId', formatter: (id) => {
      if (!id) return 'Non affecté';
      const emp = employees.find(e => e.id === id);
      return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
    }},
    { header: 'Localisation', key: 'location' },
    { header: 'Prochain contrôle', key: 'nextCheckDate', formatter: (date) => 
      date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A'
    }
  ];

  return exportService.exportToPDF(equipment, columns, {
    filename: filename || `equipements-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    template: {
      title: 'Inventaire des Équipements',
      subtitle: `État du parc matériel - ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
      author: 'Service Maintenance - SOGARA'
    }
  });
};

export const exportPackagesToPDF = (packages: PackageMail[], employees: Employee[], filename?: string) => {
  const columns: ExportColumn[] = [
    { header: 'Référence', key: 'reference' },
    { header: 'Type', key: 'type', formatter: (type) => type === 'package' ? 'Colis' : 'Courrier' },
    { header: 'Expéditeur', key: 'sender' },
    { header: 'Destinataire', key: 'recipientEmployeeId', formatter: (id) => {
      const emp = employees.find(e => e.id === id);
      return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
    }},
    { header: 'Priorité', key: 'priority', formatter: (priority) => priority === 'urgent' ? 'Urgente' : 'Normale' },
    { header: 'Statut', key: 'status', formatter: (status) => {
      const statusMap = {
        received: 'Reçu',
        stored: 'Stocké',
        delivered: 'Remis'
      };
      return statusMap[status as keyof typeof statusMap] || status;
    }},
    { header: 'Reçu le', key: 'receivedAt', formatter: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm') },
    { header: 'Remis le', key: 'deliveredAt', formatter: (date) => 
      date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : 'Non remis'
    }
  ];

  return exportService.exportToPDF(packages, columns, {
    filename: filename || `colis-courriers-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    template: {
      title: 'Registre Colis & Courriers',
      subtitle: `Traçabilité du courrier - ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
      author: 'Service Accueil - SOGARA'
    }
  });
};

export default exportService;
