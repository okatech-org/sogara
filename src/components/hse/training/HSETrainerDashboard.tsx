import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Plus,
  Filter,
  Search,
  Download,
  FileText,
  Eye,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { HSETrainingModule, HSETrainingProgress, Employee } from '@/types';
import { hseTrainingService } from '@/services/hse-training.service';
import { HSETrainingModule as TrainingModuleComponent } from './HSETrainingModule';
import { HSEQuickStartGuide } from './HSEQuickStartGuide';
import { PDFGeneratorService } from '@/services/pdf-generator.service';
import { useAuth } from '@/contexts/AppContext';

// Import des modules de formation
import inductionModule from '@/data/training-modules/hse-001-induction.json';
import h2sModule from '@/data/training-modules/hse-015-h2s.json';
import epiModule from '@/data/training-modules/hse-002-epi.json';
import fireModule from '@/data/training-modules/hse-003-incendie.json';
import confinedSpaceModule from '@/data/training-modules/hse-004-espace-confine.json';
import heightModule from '@/data/training-modules/hse-005-travail-hauteur.json';
import chemModule from '@/data/training-modules/hse-006-produits-chimiques.json';
import permitModule from '@/data/training-modules/hse-007-permis-travail.json';
import sstModule from '@/data/training-modules/hse-008-sst.json';
import lockoutModule from '@/data/training-modules/hse-009-consignation.json';
import envModule from '@/data/training-modules/hse-010-environnement.json';
import elecModule from '@/data/training-modules/hse-011-habilitation-electrique.json';

interface HSETrainerDashboardProps {
  canManage?: boolean;
}

export function HSETrainerDashboard({ canManage = true }: HSETrainerDashboardProps) {
  const { currentUser, state } = useAuth();
  const [selectedModule, setSelectedModule] = useState<HSETrainingModule | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModuleCreator, setShowModuleCreator] = useState(false);

  // Gestion du cas où state n'est pas encore initialisé
  if (!state || !state.employees) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord des formations...</p>
        </div>
      </div>
    );
  }

  // Modules de formation disponibles (ordre logique de progression)
  const trainingModules: HSETrainingModule[] = [
    inductionModule as HSETrainingModule,           // HSE-001 - Base obligatoire
    epiModule as HSETrainingModule,                 // HSE-002 - EPI de base
    fireModule as HSETrainingModule,                // HSE-003 - Incendie
    confinedSpaceModule as HSETrainingModule,       // HSE-004 - Espace confiné
    heightModule as HSETrainingModule,              // HSE-005 - Travail hauteur
    chemModule as HSETrainingModule,                // HSE-006 - Produits chimiques
    permitModule as HSETrainingModule,              // HSE-007 - Permis (management)
    sstModule as HSETrainingModule,                 // HSE-008 - Secourisme
    lockoutModule as HSETrainingModule,             // HSE-009 - Consignation
    envModule as HSETrainingModule,                 // HSE-010 - Environnement
    elecModule as HSETrainingModule,                // HSE-011 - Électricité
    h2sModule as HSETrainingModule,                 // HSE-015 - H2S (critique en fin)
  ];

  const employees = state.employees || [];

  // Statistiques des formations
  const getTrainingStats = () => {
    const allProgress = employees.flatMap(emp => 
      trainingModules.map(module => 
        hseTrainingService.getOrCreateProgress(emp.id, module.id)
      )
    );

    const completed = allProgress.filter(p => p.status === 'completed').length;
    const inProgress = allProgress.filter(p => p.status === 'in_progress').length;
    const notStarted = allProgress.filter(p => p.status === 'not_started').length;

    return {
      total: allProgress.length,
      completed,
      inProgress,
      notStarted,
      complianceRate: allProgress.length > 0 ? Math.round((completed / allProgress.length) * 100) : 0
    };
  };

  const stats = getTrainingStats();

  // Filtrer les modules
  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = searchTerm === '' || 
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Critique': return 'destructive';
      case 'Obligatoire': return 'default';
      case 'Spécialisée': return 'secondary';
      case 'Management': return 'outline';
      case 'Prévention': return 'outline';
      default: return 'outline';
    }
  };

  const getProgressForModule = (moduleId: string) => {
    return employees.map(emp => {
      const progress = hseTrainingService.getOrCreateProgress(emp.id, moduleId);
      return { employee: emp, progress };
    });
  };

  if (selectedModule && selectedEmployee) {
    return (
      <TrainingModuleComponent
        module={selectedModule}
        employeeId={selectedEmployee}
        onComplete={(progress) => {
          console.log('Formation terminée:', progress);
          setSelectedModule(null);
          setSelectedEmployee('');
        }}
        onExit={() => {
          setSelectedModule(null);
          setSelectedEmployee('');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Formations HSE</h1>
          <p className="text-muted-foreground">
            Interface formateur pour gérer et suivre les formations de sécurité
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowModuleCreator(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau module
          </Button>
        )}
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total formations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {trainingModules.length} modules disponibles
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations terminées</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Certificats délivrés
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Formations démarrées
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conformité</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
            <Progress value={stats.complianceRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="Critique">Critique</SelectItem>
                <SelectItem value="Obligatoire">Obligatoire</SelectItem>
                <SelectItem value="Spécialisée">Spécialisée</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Prévention">Prévention</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="guide" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guide">Guide de Démarrage</TabsTrigger>
          <TabsTrigger value="modules">Modules de Formation</TabsTrigger>
          <TabsTrigger value="progress">Suivi des Progressions</TabsTrigger>
          <TabsTrigger value="certificates">Certificats</TabsTrigger>
        </TabsList>

        {/* Onglet Guide de démarrage */}
        <TabsContent value="guide">
          <HSEQuickStartGuide 
            onStartTraining={(moduleId) => {
              const module = trainingModules.find(m => m.id === moduleId);
              if (module) {
                setSelectedModule(module);
                setSelectedEmployee(currentUser?.id || employees[0]?.id || '');
              }
            }}
          />
        </TabsContent>

        {/* Onglet Modules */}
        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => {
              const moduleProgress = getProgressForModule(module.id);
              const completedCount = moduleProgress.filter(p => p.progress.status === 'completed').length;
              const inProgressCount = moduleProgress.filter(p => p.progress.status === 'in_progress').length;

              return (
                <Card key={module.id} className="industrial-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant={getCategoryColor(module.category)}>
                        {module.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {module.code}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Statistiques du module */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">{completedCount}</div>
                          <div className="text-xs text-muted-foreground">Terminées</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{inProgressCount}</div>
                          <div className="text-xs text-muted-foreground">En cours</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{module.duration}h</div>
                          <div className="text-xs text-muted-foreground">Durée</div>
                        </div>
                      </div>

                      {/* Informations clés */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Validité:</span>
                          <span>{module.validityMonths} mois</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Max participants:</span>
                          <span>{module.maxParticipants}</span>
                        </div>
                        {module.certification.examRequired && (
                          <Badge variant="outline" className="w-full justify-center gap-1">
                            <Award className="w-3 h-3" />
                            Certification requise
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 gap-2">
                              <Eye className="w-4 h-4" />
                              Aperçu
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>{module.title}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[80vh]">
                              <div className="p-6">
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="font-semibold mb-2">Objectifs pédagogiques</h3>
                                    <ul className="space-y-1">
                                      {module.objectives.map((obj, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                          {obj}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h3 className="font-semibold mb-2">Modules du contenu</h3>
                                    <div className="space-y-2">
                                      {module.content.modules.map((contentModule, index) => (
                                        <div key={contentModule.id} className="flex items-center gap-3 p-2 border rounded">
                                          <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                          </span>
                                          <div className="flex-1">
                                            <div className="font-medium">{contentModule.title}</div>
                                            <div className="text-sm text-muted-foreground">{contentModule.description}</div>
                                          </div>
                                          <Badge variant="outline">{contentModule.duration}h</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="font-semibold mb-2">Évaluations</h3>
                                    <div className="space-y-2">
                                      {module.content.assessments.map((assessment) => (
                                        <div key={assessment.id} className="flex items-center justify-between p-2 border rounded">
                                          <div>
                                            <div className="font-medium">{assessment.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {assessment.questions.length} questions • {assessment.duration} min
                                            </div>
                                          </div>
                                          <Badge>Score min: {assessment.passingScore}%</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={async () => {
                            try {
                              const pdfBlob = await PDFGeneratorService.generateTrainingManualPDF(module);
                              const filename = `formation-${module.code}.pdf`;
                              await PDFGeneratorService.downloadPDF(pdfBlob, filename);
                            } catch (error) {
                              console.error('Erreur génération PDF:', error);
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>

                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedModule(module);
                            // Pour démo, on utilise l'utilisateur actuel
                            setSelectedEmployee(currentUser?.id || employees[0]?.id || '');
                          }}
                          className="flex-1 gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Démarrer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Onglet Suivi des progressions */}
        <TabsContent value="progress">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Suivi des Progressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => {
                  const employeeProgress = trainingModules.map(module => ({
                    module,
                    progress: hseTrainingService.getOrCreateProgress(employee.id, module.id)
                  }));

                  const completedCount = employeeProgress.filter(p => p.progress.status === 'completed').length;
                  const complianceRate = Math.round((completedCount / trainingModules.length) * 100);

                  return (
                    <Card key={employee.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {employee.service} • {employee.roles.join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{complianceRate}%</div>
                            <div className="text-sm text-muted-foreground">Conformité</div>
                          </div>
                        </div>
                        
                        <Progress value={complianceRate} className="mb-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {employeeProgress.map(({ module, progress }) => (
                            <div 
                              key={`${employee.id}-${module.id}`}
                              className="flex items-center gap-2 p-2 rounded border"
                            >
                              <div className={`w-3 h-3 rounded-full ${
                                progress.status === 'completed' ? 'bg-green-500' :
                                progress.status === 'in_progress' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{module.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {progress.status === 'completed' ? 'Terminé' :
                                   progress.status === 'in_progress' ? 'En cours' :
                                   'Non démarré'}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedModule(module);
                                  setSelectedEmployee(employee.id);
                                }}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Certificats */}
        <TabsContent value="certificates">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Gestion des Certificats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingModules.map((module) => {
                  const moduleProgress = getProgressForModule(module.id);
                  const certificates = moduleProgress.filter(p => p.progress.status === 'completed');

                  return (
                    <Card key={module.id} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {certificates.length} certificats délivrés
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={async () => {
                              try {
                                const pdfBlob = await PDFGeneratorService.generateTrainingManualPDF(module);
                                const filename = `manuel-${module.code}-${module.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
                                await PDFGeneratorService.downloadPDF(pdfBlob, filename);
                              } catch (error) {
                                console.error('Erreur génération PDF:', error);
                              }
                            }}
                          >
                            <Download className="w-4 h-4" />
                            Manuel PDF
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {certificates.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            Aucun certificat délivré pour cette formation
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {certificates.map(({ employee, progress }) => (
                              <div key={`${employee.id}-${module.id}`} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Obtenu le {progress.completedAt?.toLocaleDateString('fr-FR')} • 
                                    Expire le {progress.expiresAt?.toLocaleDateString('fr-FR')}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {progress.assessmentResults[0]?.score || 0}%
                                  </Badge>
                                  <Button size="sm" variant="ghost">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de création de module */}
      <Dialog open={showModuleCreator} onOpenChange={setShowModuleCreator}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Module de Formation</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Interface de création de module en cours de développement.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contactez l'équipe technique pour ajouter de nouveaux modules.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
