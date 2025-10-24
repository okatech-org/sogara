import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pdfReportService, type StrategicReportData, type ReportData } from '@/services/pdf.service';
import { useEmployees } from '@/hooks/useEmployees';
import { useIncidents } from '@/hooks/useHSE';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useEquipment } from '@/hooks/useEquipment';

export interface ReportGenerationOptions {
  includeCharts?: boolean;
  includeDetails?: boolean;
  format?: 'pdf' | 'excel' | 'csv';
  language?: 'fr' | 'en';
}

export function useReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();

  // Hooks pour récupérer les données
  const { data: employees } = useEmployees();
  const { data: incidents } = useIncidents();
  const { data: visits } = useVisits();
  const { data: packages } = usePackages();
  const { data: equipment } = useEquipment();

  const generateStrategicReport = useCallback(async (options: ReportGenerationOptions = {}) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulation de progression
      const progressSteps = [
        { step: 'Récupération des données...', progress: 20 },
        { step: 'Calcul des KPIs...', progress: 40 },
        { step: 'Génération du rapport...', progress: 70 },
        { step: 'Finalisation...', progress: 90 },
        { step: 'Terminé', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        setGenerationProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Préparation des données
      const reportData: StrategicReportData = {
        title: 'Rapport Stratégique Direction Générale',
        subtitle: 'Vue d\'ensemble consolidée',
        date: new Date().toLocaleDateString('fr-FR'),
        author: 'Direction Générale',
        company: 'SOGARA',
        sections: [],
        summary: 'Ce rapport présente une analyse complète des performances de l\'entreprise, incluant les KPIs stratégiques, la conformité HSE, les ressources humaines et les opérations.',
        kpis: {
          operationalEfficiency: 87.5,
          hseCompliance: 92.3,
          hrProductivity: 89.1,
          costOptimization: 84.7
        },
        incidents: {
          total: incidents?.length || 0,
          critical: incidents?.filter((i: any) => i.severity === 'critical').length || 0,
          resolved: incidents?.filter((i: any) => i.status === 'resolved').length || 0,
          pending: incidents?.filter((i: any) => i.status === 'pending').length || 0
        },
        employees: {
          total: employees?.length || 0,
          active: employees?.filter((e: any) => e.status === 'active').length || 0,
          onLeave: employees?.filter((e: any) => e.status === 'on_leave').length || 0,
          newHires: employees?.filter((e: any) => {
            const hireDate = new Date(e.hireDate || e.createdAt);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return hireDate > threeMonthsAgo;
          }).length || 0
        },
        visits: {
          total: visits?.length || 0,
          thisMonth: visits?.filter((v: any) => {
            const visitDate = new Date(v.visitDate || v.createdAt);
            const now = new Date();
            return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
          }).length || 0,
          pending: visits?.filter((v: any) => v.status === 'pending').length || 0
        },
        equipment: {
          total: equipment?.length || 0,
          operational: equipment?.filter((e: any) => e.status === 'operational').length || 0,
          maintenance: equipment?.filter((e: any) => e.status === 'maintenance').length || 0,
          outOfService: equipment?.filter((e: any) => e.status === 'out_of_service').length || 0
        }
      };

      // Génération du PDF
      const pdfBlob = await pdfReportService.generateStrategicReport(reportData);

      // Téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-strategique-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Rapport généré avec succès',
        description: 'Le rapport stratégique a été téléchargé',
        duration: 5000
      });

    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast({
        title: 'Erreur de génération',
        description: 'Une erreur s\'est produite lors de la génération du rapport',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [employees, incidents, visits, packages, equipment, toast]);

  const generateHSEIncidentsReport = useCallback(async (options: ReportGenerationOptions = {}) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulation de progression
      const progressSteps = [
        { step: 'Analyse des incidents...', progress: 30 },
        { step: 'Génération du rapport...', progress: 70 },
        { step: 'Finalisation...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        setGenerationProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const reportData = {
        incidents: incidents || [],
        summary: 'Rapport détaillé des incidents HSE',
        period: new Date().toLocaleDateString('fr-FR')
      };

      const pdfBlob = await pdfReportService.generateHSEIncidentsReport(reportData);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-incidents-hse-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Rapport incidents généré',
        description: 'Le rapport des incidents HSE a été téléchargé',
        duration: 5000
      });

    } catch (error) {
      console.error('Erreur lors de la génération du rapport incidents:', error);
      toast({
        title: 'Erreur de génération',
        description: 'Une erreur s\'est produite lors de la génération du rapport incidents',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [incidents, toast]);

  const generateComplianceReport = useCallback(async (options: ReportGenerationOptions = {}) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulation de progression
      const progressSteps = [
        { step: 'Vérification de la conformité...', progress: 40 },
        { step: 'Génération du rapport...', progress: 80 },
        { step: 'Finalisation...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        setGenerationProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const reportData = {
        compliance: {
          safety: 'Conforme',
          environment: 'Conforme',
          quality: 'En cours'
        },
        summary: 'Rapport de conformité réglementaire',
        period: new Date().toLocaleDateString('fr-FR')
      };

      const pdfBlob = await pdfReportService.generateComplianceReport(reportData);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-conformite-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Rapport conformité généré',
        description: 'Le rapport de conformité a été téléchargé',
        duration: 5000
      });

    } catch (error) {
      console.error('Erreur lors de la génération du rapport conformité:', error);
      toast({
        title: 'Erreur de génération',
        description: 'Une erreur s\'est produite lors de la génération du rapport conformité',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [toast]);

  return {
    isGenerating,
    generationProgress,
    generateStrategicReport,
    generateHSEIncidentsReport,
    generateComplianceReport
  };
}
