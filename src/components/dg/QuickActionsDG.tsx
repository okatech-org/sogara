import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { ReportGenerationDialog } from './ReportGenerationDialog';
import { 
  Download, 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  Users, 
  Calendar,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Shield,
  FileCheck,
  Settings
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  action: () => void;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  loading?: boolean;
  disabled?: boolean;
}

export function QuickActionsDG() {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    isGenerating, 
    generationProgress, 
    generateStrategicReport, 
    generateHSEIncidentsReport, 
    generateComplianceReport 
  } = useReportGeneration();

  const handleAction = async (actionId: string, action: () => void) => {
    setLoadingActions(prev => ({ ...prev, [actionId]: true }));
    
    try {
      // Simulation d'un délai pour les actions
      await new Promise(resolve => setTimeout(resolve, 1000));
      action();
      
      toast({
        title: "Action exécutée",
        description: "L'action a été effectuée avec succès",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'exécution de l'action",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'generate-strategic-report',
      label: 'Rapport Stratégique',
      icon: FileText,
      description: 'Rapport consolidé PDF',
      action: () => generateStrategicReport(),
      variant: 'default',
      loading: isGenerating
    },
    {
      id: 'generate-hse-report',
      label: 'Rapport Incidents HSE',
      icon: Shield,
      description: 'Analyse incidents PDF',
      action: () => generateHSEIncidentsReport(),
      variant: 'outline',
      loading: isGenerating
    },
    {
      id: 'generate-compliance-report',
      label: 'Rapport Conformité',
      icon: FileCheck,
      description: 'État conformité PDF',
      action: () => generateComplianceReport(),
      variant: 'outline',
      loading: isGenerating
    },
    {
      id: 'view-analytics',
      label: 'Voir Analytics',
      icon: BarChart3,
      description: 'Tendances et prévisions',
      action: () => navigate('/app/dg-analytics'),
      variant: 'outline'
    },
    {
      id: 'approve-decisions',
      label: 'Approuver Décisions',
      icon: CheckCircle,
      description: '3 décisions en attente',
      action: () => {
        // Simulation d'approbation de décisions
        const decisions = ['Formation HSE', 'Achat équipement', 'Recrutement'];
        console.log('Décisions approuvées:', decisions);
      },
      variant: 'default'
    },
    {
      id: 'escalate-incident',
      label: 'Escalader Incident',
      icon: AlertTriangle,
      description: '1 incident critique',
      action: () => {
        // Simulation d'escalade d'incident
        const incident = {
          id: 'INC-001',
          severity: 'critical',
          escalation: 'DG'
        };
        console.log('Incident escaladé:', incident);
      },
      variant: 'destructive'
    },
    {
      id: 'schedule-visit',
      label: 'Programmer Visite',
      icon: Calendar,
      description: 'Visite DG prévue',
      action: () => {
        // Simulation de programmation de visite
        const visit = {
          visitor: 'Client Important',
          date: new Date().toLocaleDateString('fr-FR'),
          purpose: 'Audit qualité'
        };
        console.log('Visite programmée:', visit);
      },
      variant: 'outline'
    },
    {
      id: 'export-data',
      label: 'Exporter Données',
      icon: Download,
      description: 'Export Excel/CSV',
      action: () => navigate('/app/dg-export'),
      variant: 'secondary'
    },
    {
      id: 'report-options',
      label: 'Options Rapports',
      icon: Settings,
      description: 'Configuration avancée',
      action: () => {},
      variant: 'ghost'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Actions Rapides
        </CardTitle>
        {isGenerating && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Génération en cours...
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isLoading = loadingActions[action.id] || (action.loading && isGenerating);
            
            // Rendu spécial pour le bouton d'options de rapports
            if (action.id === 'report-options') {
              return (
                <ReportGenerationDialog key={action.id}>
                  <Button
                    variant={action.variant}
                    className="h-auto flex flex-col gap-2 p-4 text-left"
                    disabled={isGenerating}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <span className="text-xs opacity-80">{action.description}</span>
                  </Button>
                </ReportGenerationDialog>
              );
            }
            
            return (
              <Button
                key={action.id}
                variant={action.variant}
                className="h-auto flex flex-col gap-2 p-4 text-left"
                onClick={() => handleAction(action.id, action.action)}
                disabled={isLoading || isGenerating}
              >
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="font-medium">{action.label}</span>
                </div>
                <span className="text-xs opacity-80">{action.description}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
