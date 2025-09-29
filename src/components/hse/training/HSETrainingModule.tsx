import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  Award, 
  CheckCircle, 
  Play, 
  Download,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HSETrainingModule as TrainingModule, HSETrainingProgress, HSEContentModule } from '@/types';
import { hseTrainingService } from '@/services/hse-training.service';
import { HSEModuleContent } from './HSEModuleContent';
import { HSEAssessmentComponent } from './HSEAssessmentComponent';
import { HSECertificateGenerator } from './HSECertificateGenerator';

interface HSETrainingModuleProps {
  module: TrainingModule;
  employeeId: string;
  onComplete?: (progress: HSETrainingProgress) => void;
  onExit?: () => void;
}

export function HSETrainingModule({ module, employeeId, onComplete, onExit }: HSETrainingModuleProps) {
  const [progress, setProgress] = useState<HSETrainingProgress | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isModuleCompleted, setIsModuleCompleted] = useState(false);

  useEffect(() => {
    // Charger ou créer la progression
    const existingProgress = hseTrainingService.getOrCreateProgress(employeeId, module.id);
    setProgress(existingProgress);

    // Si la formation n'est pas commencée, la démarrer
    if (existingProgress.status === 'not_started') {
      const startedProgress = hseTrainingService.startTraining(employeeId, module.id);
      setProgress(startedProgress);
    }

    // Déterminer le module actuel
    if (existingProgress.currentModule) {
      const moduleIndex = module.content.modules.findIndex(m => m.id === existingProgress.currentModule);
      if (moduleIndex >= 0) {
        setCurrentModuleIndex(moduleIndex);
      }
    }
  }, [employeeId, module.id]);

  const currentModule = module.content.modules[currentModuleIndex];
  const totalModules = module.content.modules.length;
  const completionRate = progress ? (progress.completedModules.length / totalModules) * 100 : 0;

  const handleModuleComplete = () => {
    if (!progress || !currentModule) return;

    // Marquer le module comme terminé
    const updatedProgress = hseTrainingService.completeModule(
      employeeId, 
      module.id, 
      currentModule.id
    );

    setProgress(updatedProgress);
    setIsModuleCompleted(true);

    // Vérifier si c'est le dernier module
    if (updatedProgress.completedModules.length === totalModules) {
      // Tous les modules terminés, proposer l'évaluation
      setShowAssessment(true);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < totalModules - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setIsModuleCompleted(false);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setIsModuleCompleted(progress?.completedModules.includes(module.content.modules[currentModuleIndex - 1].id) || false);
    }
  };

  const handleAssessmentComplete = (assessmentResult: any) => {
    if (!progress) return;

    // Enregistrer le résultat
    const updatedProgress = hseTrainingService.recordAssessmentResult(
      employeeId,
      module.id,
      assessmentResult
    );

    setProgress(updatedProgress);

    // Si l'évaluation est réussie, finaliser la formation
    if (assessmentResult.passed) {
      const completedProgress = hseTrainingService.completeTraining(
        employeeId,
        module.id,
        module.validityMonths
      );
      setProgress(completedProgress);
      setShowAssessment(false);
      setShowCertificate(true);
      onComplete?.(completedProgress);
    }
  };

  const resetTraining = () => {
    const resetProgress = hseTrainingService.resetTraining(employeeId, module.id);
    setProgress(resetProgress);
    setCurrentModuleIndex(0);
    setIsModuleCompleted(false);
    setShowAssessment(false);
    setShowCertificate(false);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'Critique': return 'destructive';
      case 'Obligatoire': return 'default';
      case 'Spécialisée': return 'secondary';
      default: return 'outline';
    }
  };

  if (!progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête de la formation */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant={getCategoryBadgeVariant(module.category)}>
                  {module.category}
                </Badge>
                <Badge variant="outline">
                  {module.code}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{module.title}</CardTitle>
              <p className="text-muted-foreground">{module.description}</p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {module.duration} {module.durationUnit}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Max {module.maxParticipants} participants
              </div>
              {module.certification.examRequired && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  Certification requise
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progression */}
            <div className="space-y-3">
              <h3 className="font-medium">Progression</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Modules complétés</span>
                  <span>{progress.completedModules.length}/{totalModules}</span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(completionRate)}% terminé
                </p>
              </div>
            </div>

            {/* Objectifs */}
            <div className="space-y-3">
              <h3 className="font-medium">Objectifs</h3>
              <ul className="space-y-2">
                {module.objectives.slice(0, 4).map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Target className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informations */}
            <div className="space-y-3">
              <h3 className="font-medium">Informations</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Validité:</span>
                  <span>{module.validityMonths} mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Prérequis:</span>
                  <span>{module.prerequisites.length > 0 ? module.prerequisites.join(', ') : 'Aucun'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recyclage:</span>
                  <span>{module.refresherRequired ? `${module.refresherFrequency} mois` : 'Non requis'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              {progress.status === 'completed' && (
                <Button variant="outline" onClick={resetTraining} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Recommencer
                </Button>
              )}
              <Button variant="outline" onClick={onExit}>
                Retour au catalogue
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {progress.status === 'completed' && (
                <Button onClick={() => setShowCertificate(true)} className="gap-2">
                  <Award className="w-4 h-4" />
                  Voir le certificat
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu du module actuel */}
      {currentModule && (
        <Card className="industrial-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {currentModuleIndex + 1}
                  </div>
                  {currentModule.title}
                </CardTitle>
                <p className="text-muted-foreground mt-1">{currentModule.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {currentModule.duration}h
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <HSEModuleContent 
              module={currentModule}
              onComplete={handleModuleComplete}
              isCompleted={progress.completedModules.includes(currentModule.id)}
            />

            {/* Navigation entre modules */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePreviousModule}
                disabled={currentModuleIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Module précédent
              </Button>

              <div className="flex items-center gap-2">
                {module.content.modules.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentModuleIndex
                        ? 'bg-primary'
                        : progress.completedModules.includes(module.content.modules[index].id)
                        ? 'bg-success'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {currentModuleIndex < totalModules - 1 ? (
                <Button
                  onClick={handleNextModule}
                  disabled={!progress.completedModules.includes(currentModule.id)}
                  className="gap-2"
                >
                  Module suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAssessment(true)}
                  disabled={progress.completedModules.length !== totalModules}
                  className="gap-2"
                >
                  <Award className="w-4 h-4" />
                  Passer l'évaluation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ressources téléchargeables */}
      {module.content.resources.length > 0 && (
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Ressources et Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {module.content.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                  {resource.downloadable && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status et avertissements */}
      {progress.status === 'completed' && progress.expiresAt && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Formation terminée avec succès le {progress.completedAt?.toLocaleDateString('fr-FR')}.
            Certificat valide jusqu'au {progress.expiresAt.toLocaleDateString('fr-FR')}.
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog d'évaluation */}
      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Évaluation - {module.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <HSEAssessmentComponent
              assessments={module.content.assessments}
              onComplete={handleAssessmentComplete}
              onCancel={() => setShowAssessment(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog du certificat */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificat de Formation</DialogTitle>
          </DialogHeader>
          <HSECertificateGenerator
            module={module}
            progress={progress}
            employeeId={employeeId}
            onDownload={() => {}}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
