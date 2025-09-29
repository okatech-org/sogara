import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HSETrainingModule, HSETrainingProgress, Employee } from '@/types';

export class PDFGeneratorService {
  private static readonly SOGARA_PRIMARY_COLOR = '#1e40af';
  private static readonly SOGARA_SECONDARY_COLOR = '#3b82f6';

  static async generateTrainingCertificate(
    module: HSETrainingModule,
    progress: HSETrainingProgress,
    employee: Employee
  ): Promise<Blob> {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Couleurs SOGARA
    const primaryColor = this.hexToRgb(this.SOGARA_PRIMARY_COLOR);
    const secondaryColor = this.hexToRgb(this.SOGARA_SECONDARY_COLOR);

    // Marges
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    // En-tête avec logo SOGARA
    this.addHeader(pdf, margin, contentWidth);

    // Titre du certificat
    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.setFont('helvetica', 'bold');
    const titleText = 'CERTIFICAT DE FORMATION HSE';
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - titleWidth) / 2, 60);

    // Sous-titre
    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    const subtitleText = module.certification.certificateType;
    const subtitleWidth = pdf.getTextWidth(subtitleText);
    pdf.text(subtitleText, (pageWidth - subtitleWidth) / 2, 70);

    // Informations du participant
    this.addParticipantInfo(pdf, employee, margin, 90);

    // Informations de la formation
    this.addTrainingInfo(pdf, module, margin, 120);

    // Détails de certification
    this.addCertificationDetails(pdf, progress, margin, 150);

    // Signatures
    this.addSignatures(pdf, margin, pageHeight - 60);

    // Pied de page
    this.addFooter(pdf, margin, pageHeight - 20, contentWidth);

    return pdf.output('blob');
  }

  static async generateTrainingModulePDF(module: HSETrainingModule): Promise<Blob> {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // En-tête
    this.addHeader(pdf, margin, contentWidth);

    // Titre de la formation
    pdf.setFontSize(20);
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'bold');
    pdf.text(module.title, margin, 60);

    // Code et catégorie
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Code: ${module.code} | Catégorie: ${module.category}`, margin, 70);

    let yPosition = 80;

    // Description
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const descriptionLines = pdf.splitTextToSize(module.description, contentWidth);
    pdf.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 5 + 10;

    // Objectifs
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Objectifs pédagogiques', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    module.objectives.forEach((objective, index) => {
      const objectiveText = `• ${objective}`;
      const lines = pdf.splitTextToSize(objectiveText, contentWidth - 5);
      pdf.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 4 + 2;
    });

    yPosition += 10;

    // Modules de contenu
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Programme de formation', margin, yPosition);
    yPosition += 8;

    module.content.modules.forEach((contentModule, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Module ${index + 1}: ${contentModule.title}`, margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Durée: ${contentModule.duration}h`, margin + 5, yPosition);
      yPosition += 4;

      pdf.setTextColor(0, 0, 0);
      const descLines = pdf.splitTextToSize(contentModule.description, contentWidth - 10);
      pdf.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 4 + 8;
    });

    // Informations pratiques
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations pratiques', margin, yPosition);
    yPosition += 10;

    const practicalInfo = [
      `Durée totale: ${module.duration} ${module.durationUnit}`,
      `Validité du certificat: ${module.validityMonths} mois`,
      `Participants maximum: ${module.maxParticipants}`,
      `Prérequis: ${module.prerequisites.length > 0 ? module.prerequisites.join(', ') : 'Aucun'}`,
      `Méthodes: ${module.deliveryMethods.join(', ')}`,
      `Recyclage requis: ${module.refresherRequired ? `Tous les ${module.refresherFrequency} mois` : 'Non'}`
    ];

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    practicalInfo.forEach(info => {
      pdf.text(`• ${info}`, margin + 5, yPosition);
      yPosition += 5;
    });

    this.addFooter(pdf, margin, pdf.internal.pageSize.getHeight() - 20, contentWidth);

    return pdf.output('blob');
  }

  private static addHeader(pdf: jsPDF, margin: number, contentWidth: number) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Ligne de bordure supérieure
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(1);
    pdf.line(margin, 15, pageWidth - margin, 15);

    // Logo SOGARA (simulé avec du texte pour l'instant)
    pdf.setFontSize(18);
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SOGARA', margin, 25);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Société Gabonaise de Raffinage', margin, 32);

    // Date de génération
    pdf.setFontSize(8);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin - 40, 25);
  }

  private static addParticipantInfo(pdf: jsPDF, employee: Employee, margin: number, yPosition: number) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Cadre pour les informations participant
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 25);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Certifie que', margin + 5, yPosition + 8);

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    const fullName = `${employee.firstName} ${employee.lastName}`;
    const nameWidth = pdf.getTextWidth(fullName);
    pdf.text(fullName, (pageWidth - nameWidth) / 2, yPosition + 15);

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    const details = `Matricule: ${employee.matricule} • Service: ${employee.service}`;
    const detailsWidth = pdf.getTextWidth(details);
    pdf.text(details, (pageWidth - detailsWidth) / 2, yPosition + 21);
  }

  private static addTrainingInfo(pdf: jsPDF, module: HSETrainingModule, margin: number, yPosition: number) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('a suivi avec succès la formation', margin + 5, yPosition + 3);

    pdf.setFontSize(14);
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(module.title);
    pdf.text(module.title, (pageWidth - titleWidth) / 2, yPosition + 12);

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    const subtitle = `Code: ${module.code} • Durée: ${module.duration} ${module.durationUnit}`;
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, yPosition + 18);
  }

  private static addCertificationDetails(pdf: jsPDF, progress: HSETrainingProgress, margin: number, yPosition: number) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const columnWidth = (pageWidth - (margin * 2) - 20) / 3;

    // Cadre pour les détails
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 25);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);

    // Date d'obtention
    pdf.text('Date d\'obtention', margin + 5, yPosition + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(progress.completedAt?.toLocaleDateString('fr-FR') || '', margin + 5, yPosition + 14);

    // Validité
    pdf.setFont('helvetica', 'bold');
    pdf.text('Validité jusqu\'au', margin + 5 + columnWidth, yPosition + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(progress.expiresAt?.toLocaleDateString('fr-FR') || '', margin + 5 + columnWidth, yPosition + 14);

    // Score
    pdf.setFont('helvetica', 'bold');
    pdf.text('Score obtenu', margin + 5 + (columnWidth * 2), yPosition + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${progress.assessmentResults[0]?.score || 0}%`, margin + 5 + (columnWidth * 2), yPosition + 14);
  }

  private static addSignatures(pdf: jsPDF, margin: number, yPosition: number) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const signatureWidth = (pageWidth - (margin * 2) - 20) / 2;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    // Signature HSE
    pdf.text('Responsable HSE', margin + 5, yPosition);
    pdf.line(margin + 5, yPosition + 5, margin + 5 + signatureWidth, yPosition + 5);
    pdf.setFontSize(8);
    pdf.text('Marie LAKIBI', margin + 5, yPosition + 12);

    // Signature Direction
    pdf.setFontSize(10);
    pdf.text('Directeur', margin + signatureWidth + 15, yPosition);
    pdf.line(margin + signatureWidth + 15, yPosition + 5, pageWidth - margin - 5, yPosition + 5);
    pdf.setFontSize(8);
    pdf.text('SOGARA', margin + signatureWidth + 15, yPosition + 12);
  }

  private static addFooter(pdf: jsPDF, margin: number, yPosition: number, contentWidth: number) {
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    
    const footerText = 'SOGARA - Société Gabonaise de Raffinage | www.sogara.com | HSE@sogara.com';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pdf.internal.pageSize.getWidth() - footerWidth) / 2, yPosition);

    // Ligne de bordure inférieure
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition + 5, pdf.internal.pageSize.getWidth() - margin, yPosition + 5);
  }

  static async generateTrainingManualPDF(module: HSETrainingModule): Promise<Blob> {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    let yPosition = 30;

    // Page de couverture
    this.addHeader(pdf, margin, contentWidth);

    // Titre principal
    pdf.setFontSize(24);
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(module.title, contentWidth);
    pdf.text(titleLines, margin, 60);

    // Information formation
    yPosition = 80 + (titleLines.length * 8);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    const infoText = [
      `Code Formation: ${module.code}`,
      `Catégorie: ${module.category}`,
      `Durée: ${module.duration} ${module.durationUnit}`,
      `Validité: ${module.validityMonths} mois`,
      `Public cible: ${module.requiredForRoles.join(', ')}`
    ];

    infoText.forEach(text => {
      pdf.text(text, margin, yPosition);
      yPosition += 6;
    });

    // Description
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', margin, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    const descriptionLines = pdf.splitTextToSize(module.description, contentWidth);
    pdf.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 5 + 10;

    // Objectifs
    pdf.setFont('helvetica', 'bold');
    pdf.text('Objectifs pédagogiques', margin, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    module.objectives.forEach(objective => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 30;
      }
      const objText = `• ${objective}`;
      const lines = pdf.splitTextToSize(objText, contentWidth - 5);
      pdf.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 4 + 3;
    });

    // Nouvelle page pour les modules
    pdf.addPage();
    yPosition = 30;

    // Contenu des modules
    module.content.modules.forEach((contentModule, moduleIndex) => {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 30;
      }

      // Titre du module
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175);
      pdf.text(`Module ${moduleIndex + 1}: ${contentModule.title}`, margin, yPosition);
      yPosition += 10;

      // Description du module
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Durée: ${contentModule.duration}h - ${contentModule.description}`, margin, yPosition);
      yPosition += 8;

      // Contenu des sections
      contentModule.content.forEach((section, sectionIndex) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 30;
        }

        // Titre de section
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${sectionIndex + 1}. ${section.title}`, margin + 5, yPosition);
        yPosition += 8;

        // Contenu de section (simplifié)
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const contentLines = pdf.splitTextToSize(
          section.content.substring(0, 500) + (section.content.length > 500 ? '...' : ''),
          contentWidth - 10
        );
        pdf.text(contentLines, margin + 10, yPosition);
        yPosition += contentLines.length * 3 + 8;
      });

      yPosition += 5;
    });

    this.addFooter(pdf, margin, pageHeight - 20, contentWidth);

    return pdf.output('blob');
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  static async downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
