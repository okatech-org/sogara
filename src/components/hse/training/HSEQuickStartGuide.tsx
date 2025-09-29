import { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  Download,
  CheckCircle,
  ArrowRight,
  Play,
  FileText,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HSEQuickStartGuideProps {
  onStartTraining?: (moduleId: string) => void;
}

export function HSEQuickStartGuide({ onStartTraining }: HSEQuickStartGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const quickStartSteps = [
    {
      id: 'explore-modules',
      title: 'Explorer les Modules',
      description: 'Découvrez les 6 formations HSE disponibles',
      action: 'Voir les modules',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'start-critical',
      title: 'Formation Critique H2S',
      description: 'Commencez par la formation la plus importante',
      action: 'Démarrer H2S',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-red-500'
    },
    {
      id: 'download-materials',
      title: 'Télécharger Supports',
      description: 'Obtenez les PDF avec logo SOGARA',
      action: 'Télécharger PDF',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'track-progress',
      title: 'Suivre les Progressions',
      description: 'Monitorer l\'avancement des employés',
      action: 'Voir suivi',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ];

  const availableModules = [
    { code: 'HSE-001', title: 'Induction HSE', category: 'Obligatoire', critical: false },
    { code: 'HSE-002', title: 'Port des EPI', category: 'Obligatoire', critical: false },
    { code: 'HSE-003', title: 'Lutte Incendie', category: 'Obligatoire', critical: false },
    { code: 'HSE-004', title: 'Espace Confiné', category: 'Critique', critical: true },
    { code: 'HSE-005', title: 'Travail Hauteur', category: 'Spécialisée', critical: false },
    { code: 'HSE-006', title: 'Produits Chimiques', category: 'Obligatoire', critical: false },
    { code: 'HSE-007', title: 'Permis Travail', category: 'Management', critical: false },
    { code: 'HSE-008', title: 'Secourisme SST', category: 'Obligatoire', critical: false },
    { code: 'HSE-009', title: 'Consignation', category: 'Spécialisée', critical: false },
    { code: 'HSE-010', title: 'Environnement', category: 'Prévention', critical: false },
    { code: 'HSE-011', title: 'Habilitation Électrique', category: 'Spécialisée', critical: false },
    { code: 'HSE-015', title: 'H2S Critique', category: 'Critique', critical: true }
  ];

  return (
    <div className="space-y-6">
      {/* Bannière de bienvenue */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-900">
                Bienvenue dans le Système de Formation HSE SOGARA
              </h2>
              <p className="text-blue-700 mt-1">
                Interface complète pour gérer les formations de sécurité avec contenus interactifs et PDF téléchargeables
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Étapes de démarrage rapide */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Démarrage Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickStartSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 border rounded-lg transition-all ${
                  completedSteps.has(step.id) 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${step.color}`}>
                    {completedSteps.has(step.id) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-2"
                      onClick={() => markStepCompleted(step.id)}
                      disabled={completedSteps.has(step.id)}
                    >
                      {completedSteps.has(step.id) ? 'Terminé' : step.action}
                      {!completedSteps.has(step.id) && <ArrowRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aperçu des modules */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Modules de Formation Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableModules.map((module) => (
              <div
                key={module.code}
                className={`p-3 border rounded-lg ${
                  module.critical ? 'border-red-200 bg-red-50' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={module.critical ? 'destructive' : 'default'}>
                    {module.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {module.code}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">{module.title}</h4>
                {module.critical && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">Formation critique</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fonctionnalités clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-green-900">Contenu Interactif</h3>
              <p className="text-sm text-green-700 mt-2">
                Modules avec illustrations, schémas et évaluations intégrées
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900">PDF Professionnels</h3>
              <p className="text-sm text-blue-700 mt-2">
                Génération automatique avec logo SOGARA et mise en page soignée
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900">Suivi Avancé</h3>
              <p className="text-sm text-purple-700 mt-2">
                Tracking complet des progressions et certificats
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aide et support */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Aide :</strong> Utilisez l'onglet "Modules" pour accéder à l'interface complète de formation.
          Chaque formation inclut des évaluations, des certificats et des supports PDF téléchargeables.
        </AlertDescription>
      </Alert>
    </div>
  );
}
