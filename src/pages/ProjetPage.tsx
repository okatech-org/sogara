import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Users, 
  Calendar, 
  Package, 
  HardHat, 
  Shield, 
  Newspaper, 
  Database,
  Zap,
  Lock,
  Workflow,
  Code,
  Layers,
  Globe
} from 'lucide-react';

export function ProjetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation Projet SOGARA</h1>
          <p className="text-muted-foreground">
            Guide complet d'implémentation et d'architecture du système
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Version 1.0
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="accounts">Comptes Utilisateurs</TabsTrigger>
          <TabsTrigger value="modules">Modules Détaillés</TabsTrigger>
          <TabsTrigger value="functions">Fonctions Système</TabsTrigger>
          <TabsTrigger value="roles">Permissions</TabsTrigger>
          <TabsTrigger value="implementation">Guide Technique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Objectif du Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  SOGARA est un système de gestion intégrée pour l'administration d'une raffinerie pétrolière,
                  couvrant la gestion du personnel, des visites, du courrier, des équipements et de la sécurité HSE.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Fonctionnalités principales :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Gestion centralisée du personnel et des rôles</li>
                    <li>• Suivi des visites et accès sécurisé</li>
                    <li>• Traçabilité du courrier et des colis</li>
                    <li>• Maintenance préventive des équipements</li>
                    <li>• Conformité HSE et formation</li>
                    <li>• Communication interne (SOGARA Connect)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Technologies Utilisées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <Badge variant="secondary">Frontend</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      React 18, TypeScript, Tailwind CSS, Vite
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">UI Components</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shadcn/ui, Radix UI, Lucide React
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">État & Données</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Context API, Local Storage, Hooks personnalisés
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">Outils</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      ESLint, Date-fns, Class Variance Authority
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Comptes Utilisateurs de Test</CardTitle>
              <CardDescription>
                Détail des comptes disponibles et leurs accès spécifiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 border-red-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">ADMIN</Badge>
                        <span className="font-semibold">Mamadou DIALLO (ADM001)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fonction :</strong> Directeur Administratif
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsabilités :</strong>
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Supervision générale de tous les systèmes</li>
                        <li>• Gestion des utilisateurs et permissions</li>
                        <li>• Configuration système et paramètres</li>
                        <li>• Accès à la documentation technique</li>
                        <li>• Validation des processus critiques</li>
                        <li>• Rapports et analytics complets</li>
                      </ul>
                      <Badge variant="outline" className="text-xs">
                        Accès : Tous les modules
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">HSE</Badge>
                        <span className="font-semibold">Fatou NDIAYE (HSE001)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fonction :</strong> Responsable HSE
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsabilités :</strong>
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Gestion des incidents de sécurité</li>
                        <li>• Organisation des formations HSE</li>
                        <li>• Suivi de la conformité réglementaire</li>
                        <li>• Inspection des équipements de sécurité</li>
                        <li>• Validation des habilitations</li>
                        <li>• Rapports de sécurité mensuels</li>
                      </ul>
                      <Badge variant="outline" className="text-xs">
                        Accès : Personnel, Équipements, HSE
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">SUPERVISEUR</Badge>
                        <span className="font-semibold">Ousmane FALL (SUP001)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fonction :</strong> Chef d'Équipe Production
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsabilités :</strong>
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Supervision des équipes terrain</li>
                        <li>• Validation des visites importantes</li>
                        <li>• Suivi des équipements critiques</li>
                        <li>• Coordination avec les services</li>
                        <li>• Rapports d'activité quotidiens</li>
                        <li>• Gestion des urgences opérationnelles</li>
                      </ul>
                      <Badge variant="outline" className="text-xs">
                        Accès : Personnel, Visites, Équipements
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">RECEP</Badge>
                        <span className="font-semibold">Aïssa TOURE (REC001)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fonction :</strong> Réceptionniste Principal
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsabilités :</strong>
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Accueil et enregistrement des visiteurs</li>
                        <li>• Attribution et récupération des badges</li>
                        <li>• Réception du courrier et des colis</li>
                        <li>• Distribution aux destinataires</li>
                        <li>• Gestion du registre d'entrées</li>
                        <li>• Premier contact sécuritaire</li>
                      </ul>
                      <Badge variant="outline" className="text-xs">
                        Accès : Visites, Colis & Courriers
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">COMMUNICATION</Badge>
                        <span className="font-semibold">Aminata SECK (COM001)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fonction :</strong> Chargée de Communication
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsabilités :</strong>
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Création de contenu SOGARA Connect</li>
                        <li>• Publication d'actualités entreprise</li>
                        <li>• Organisation d'événements internes</li>
                        <li>• Gestion des annonces officielles</li>
                        <li>• Animation de la vie sociale</li>
                        <li>• Relations publiques internes</li>
                      </ul>
                      <Badge variant="outline" className="text-xs">
                        Accès : SOGARA Connect (édition complète)
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">EMPLOYE</Badge>
                        <span className="font-semibold">Ibrahima KANE (EMP001)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fonction :</strong> Technicien Raffinage
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsabilités :</strong>
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Consultation des informations générales</li>
                        <li>• Lecture des actualités internes</li>
                        <li>• Suivi des indicateurs personnels</li>
                        <li>• Participation aux événements</li>
                        <li>• Accès aux informations de service</li>
                        <li>• Consultation planning formations</li>
                      </ul>
                      <Badge variant="outline" className="text-xs">
                        Accès : Dashboard, SOGARA Connect (lecture)
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Instructions de Test</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Pour tester le système, utilisez les matricules suivants lors de la connexion :
                  </p>
                  <div className="grid gap-2 text-sm font-mono">
                    <div><strong>ADM001</strong> - Accès administrateur complet</div>
                    <div><strong>HSE001</strong> - Modules sécurité et personnel</div>
                    <div><strong>SUP001</strong> - Supervision équipes et équipements</div>
                    <div><strong>REC001</strong> - Accueil et gestion courrier</div>
                    <div><strong>COM001</strong> - Gestion contenu et communication</div>
                    <div><strong>EMP001</strong> - Consultation simple</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid gap-6">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Modules du Système</CardTitle>
                <CardDescription>
                  Description détaillée de chaque module fonctionnel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <Card className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex items-start gap-3">
                        <Users className="w-8 h-8 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Module Personnel</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Gestion complète des ressources humaines et compétences
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Fonctionnalités :</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                              <li>• <strong>Fiche employé :</strong> Informations personnelles, service, matricule</li>
                              <li>• <strong>Gestion des rôles :</strong> Attribution et modification des permissions</li>
                              <li>• <strong>Compétences :</strong> Suivi des qualifications et certifications</li>
                              <li>• <strong>Habilitations :</strong> Autorisations d'accès aux zones/équipements</li>
                              <li>• <strong>Statistiques :</strong> Visites reçues, colis, formations HSE</li>
                              <li>• <strong>Recherche avancée :</strong> Par service, rôle, compétence</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-l-4 border-l-green-500">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-8 h-8 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Module Visites</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Contrôle d'accès et traçabilité des visiteurs
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Fonctionnalités :</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                              <li>• <strong>Planification :</strong> Programmation des visites avec hôte assigné</li>
                              <li>• <strong>Enregistrement visiteurs :</strong> Identité, société, documents</li>
                              <li>• <strong>Check-in/out :</strong> Contrôle d'entrée et sortie horodaté</li>
                              <li>• <strong>Gestion badges :</strong> Attribution et récupération sécurisée</li>
                              <li>• <strong>Statuts temps réel :</strong> Attendu, en attente, en cours, parti</li>
                              <li>• <strong>Historique :</strong> Traçabilité complète des accès</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-l-4 border-l-purple-500">
                      <div className="flex items-start gap-3">
                        <Package className="w-8 h-8 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Module Colis & Courriers</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Traçabilité complète du courrier entrant et sortant
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Fonctionnalités :</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                              <li>• <strong>Réception :</strong> Enregistrement avec photo et référence unique</li>
                              <li>• <strong>Classification :</strong> Colis/courrier, priorité normale/urgente</li>
                              <li>• <strong>Attribution :</strong> Assignation au destinataire final</li>
                              <li>• <strong>Notifications :</strong> Alertes automatiques au destinataire</li>
                              <li>• <strong>Remise :</strong> Signature électronique et horodatage</li>
                              <li>• <strong>Suivi :</strong> États reçu, stocké, remis avec historique</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="p-4 border-l-4 border-l-orange-500">
                      <div className="flex items-start gap-3">
                        <HardHat className="w-8 h-8 text-orange-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Module Équipements</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Gestion d'inventaire et maintenance préventive
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Fonctionnalités :</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                              <li>• <strong>Inventaire :</strong> Catalogage par type, numéro de série, localisation</li>
                              <li>• <strong>Attribution :</strong> Assignation nominative aux porteurs</li>
                              <li>• <strong>États :</strong> Opérationnel, maintenance, hors service</li>
                              <li>• <strong>Planification :</strong> Échéances de vérification automatisées</li>
                              <li>• <strong>Historique :</strong> Traçabilité des affectations et interventions</li>
                              <li>• <strong>Alertes :</strong> Notifications préventives avant échéances</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-l-4 border-l-red-500">
                      <div className="flex items-start gap-3">
                        <Shield className="w-8 h-8 text-red-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Module HSE</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Hygiène, Sécurité, Environnement et conformité
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Fonctionnalités :</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                              <li>• <strong>Incidents :</strong> Déclaration, investigation, résolution</li>
                              <li>• <strong>Formations :</strong> Organisation sessions, suivi participation</li>
                              <li>• <strong>Conformité :</strong> Taux de conformité et indicateurs KPI</li>
                              <li>• <strong>Certifications :</strong> Validité et renouvellement automatique</li>
                              <li>• <strong>Audits :</strong> Planification et suivi des contrôles</li>
                              <li>• <strong>Rapports :</strong> Tableaux de bord sécurité règlementaires</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-l-4 border-l-cyan-500">
                      <div className="flex items-start gap-3">
                        <Newspaper className="w-8 h-8 text-cyan-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">SOGARA Connect</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Plateforme de communication et information interne
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Fonctionnalités :</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                              <li>• <strong>Articles :</strong> Actualités, annonces, événements de l'entreprise</li>
                              <li>• <strong>Médias :</strong> Images multiples, vidéos YouTube/Vimeo intégrées</li>
                              <li>• <strong>Catégories :</strong> News, activités, annonces, événements</li>
                              <li>• <strong>Édition :</strong> Interface WYSIWYG pour le service communication</li>
                              <li>• <strong>Publication :</strong> Gestion brouillon/publié/archivé</li>
                              <li>• <strong>Engagement :</strong> Système de commentaires et interaction</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <div className="grid gap-6">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Fonctions Système Principales
                </CardTitle>
                <CardDescription>
                  Détail du fonctionnement des principales fonctions de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                      🔐 Système d'Authentification
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Fonction :</strong> <code>useAuth().login(matricule)</code></p>
                      <p><strong>Processus :</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4 text-muted-foreground">
                        <li>Validation du matricule contre la base employés</li>
                        <li>Récupération du profil utilisateur complet</li>
                        <li>Initialisation du contexte avec rôles et permissions</li>
                        <li>Persistance de la session dans LocalStorage</li>
                        <li>Redirection vers le dashboard approprié</li>
                      </ol>
                      <p><strong>Sécurité :</strong> Vérification des rôles à chaque navigation</p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-green-50 dark:bg-green-950">
                    <h3 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                      👥 Gestion des Employés
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Fonctions principales :</strong></p>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>• <code>useEmployees().addEmployee()</code> - Création nouveau profil</li>
                        <li>• <code>useEmployees().updateEmployee()</code> - Modification données</li>
                        <li>• <code>useEmployees().updateEmployeeRoles()</code> - Gestion permissions</li>
                        <li>• <code>useEmployees().updateCompetences()</code> - Mise à jour compétences</li>
                        <li>• <code>useEmployees().updateHabilitations()</code> - Gestion autorisations</li>
                      </ul>
                      <p><strong>Algorithme de recherche :</strong> Filtrage multi-critères temps réel</p>
                      <p><strong>Statistiques :</strong> Calcul automatique des KPI par employé</p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-purple-50 dark:bg-purple-950">
                    <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                      📅 Workflow des Visites
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>États de transition :</strong></p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <code className="text-xs">
                          expected → waiting → in_progress → checked_out
                        </code>
                      </div>
                      <p><strong>Fonctions de gestion :</strong></p>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>• <code>scheduleVisit()</code> - Planification avec hôte</li>
                        <li>• <code>checkInVisitor()</code> - Arrivée et attribution badge</li>
                        <li>• <code>checkOutVisitor()</code> - Départ et récupération badge</li>
                        <li>• <code>updateVisitStatus()</code> - Changement d'état horodaté</li>
                      </ul>
                      <p><strong>Business Logic :</strong> Validation automatique des créneaux et conflits</p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-orange-50 dark:bg-orange-950">
                    <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">
                      📦 Traçabilité Colis
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Cycle de vie complet :</strong></p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-medium">RECEIVED</div>
                          <div className="text-muted-foreground">Réception</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-medium">STORED</div>
                          <div className="text-muted-foreground">Stockage</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-medium">DELIVERED</div>
                          <div className="text-muted-foreground">Remis</div>
                        </div>
                      </div>
                      <p><strong>Algorithmes :</strong></p>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>• Génération automatique de références uniques</li>
                        <li>• Système de priorités avec notifications push</li>
                        <li>• Signature électronique lors de la remise</li>
                        <li>• Horodatage précis de chaque étape</li>
                      </ul>
                    </div>
                  </Card>

                  <Card className="p-4 bg-red-50 dark:bg-red-950">
                    <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3">
                      🛡️ Moteur HSE
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Gestion des incidents :</strong></p>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>• Classification automatique par sévérité (low/medium/high)</li>
                        <li>• Workflow d'investigation avec assignation d'enquêteurs</li>
                        <li>• Génération de rapports conformes aux normes ISO</li>
                        <li>• Calcul automatique des taux de fréquence/gravité</li>
                      </ul>
                      <p><strong>Formations HSE :</strong></p>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>• Planificateur intelligent basé sur les rôles</li>
                        <li>• Suivi automatique des certifications et échéances</li>
                        <li>• Calcul du taux de conformité réglementaire</li>
                        <li>• Alertes préventives avant expiration</li>
                      </ul>
                    </div>
                  </Card>

                  <Card className="p-4 bg-cyan-50 dark:bg-cyan-950">
                    <h3 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-3">
                      📊 Dashboard Intelligence
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Calculs temps réel :</strong></p>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>• <strong>KPI Visites :</strong> Agrégation par statut avec compteurs live</li>
                        <li>• <strong>Métriques Colis :</strong> Alertes urgentes et taux de traitement</li>
                        <li>• <strong>Indicateurs Équipements :</strong> Échéances et taux de disponibilité</li>
                        <li>• <strong>Score HSE :</strong> Conformité réglementaire et incidents ouverts</li>
                      </ul>
                      <p><strong>Algorithme de priorisation :</strong> Tri intelligent des tâches urgentes</p>
                      <p><strong>Analytics :</strong> Tendances et prédictions basées sur l'historique</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <div className="grid gap-6">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Architecture Frontend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Structure des Composants</h4>
                    <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                      <div>src/</div>
                      <div className="ml-2">├── components/</div>
                      <div className="ml-4">│   ├── Layout/ (Header, Navigation, Layout)</div>
                      <div className="ml-4">│   ├── auth/ (LoginForm)</div>
                      <div className="ml-4">│   └── ui/ (Shadcn components)</div>
                      <div className="ml-2">├── pages/ (Dashboard, PersonnelPage, etc.)</div>
                      <div className="ml-2">├── hooks/ (useEmployees, useVisits, etc.)</div>
                      <div className="ml-2">├── contexts/ (AppContext)</div>
                      <div className="ml-2">├── services/ (repositories)</div>
                      <div className="ml-2">└── types/ (TypeScript interfaces)</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Gestion d'État</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <strong>AppContext :</strong> État global avec useReducer</li>
                      <li>• <strong>LocalStorage :</strong> Persistance des données</li>
                      <li>• <strong>Hooks personnalisés :</strong> Logique métier encapsulée</li>
                      <li>• <strong>Repositories :</strong> Couche d'accès aux données</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Modèle de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3 text-sm">
                    <div>
                      <Badge>Employee</Badge>
                      <p className="text-muted-foreground mt-1">
                        Informations personnelles, rôles, compétences, habilitations, statistiques
                      </p>
                    </div>
                    <div>
                      <Badge>Visitor</Badge>
                      <p className="text-muted-foreground mt-1">
                        Données visiteur : identité, société, documents
                      </p>
                    </div>
                    <div>
                      <Badge>Visit</Badge>
                      <p className="text-muted-foreground mt-1">
                        Planification, check-in/out, statut, hôte, badge
                      </p>
                    </div>
                    <div>
                      <Badge>PackageMail</Badge>
                      <p className="text-muted-foreground mt-1">
                        Colis et courrier : expéditeur, destinataire, statut, signature
                      </p>
                    </div>
                    <div>
                      <Badge>Equipment</Badge>
                      <p className="text-muted-foreground mt-1">
                        Inventaire : type, porteur, statut, historique maintenance
                      </p>
                    </div>
                    <div>
                      <Badge>HSEIncident</Badge>
                      <p className="text-muted-foreground mt-1">
                        Incidents sécurité : type, gravité, investigation
                      </p>
                    </div>
                    <div>
                      <Badge>HSETraining</Badge>
                      <p className="text-muted-foreground mt-1">
                        Formations : sessions, participants, certifications
                      </p>
                    </div>
                    <div>
                      <Badge>Post</Badge>
                      <p className="text-muted-foreground mt-1">
                        Articles SOGARA Connect : contenu, médias, catégories
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Système de Rôles et Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">ADMIN</Badge>
                        <span className="text-sm font-medium">Administrateur</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Accès complet à tous les modules. Gestion des utilisateurs et configuration système.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Modules : Tous + Documentation Projet
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">HSE</Badge>
                        <span className="text-sm font-medium">Responsable HSE</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gestion sécurité, incidents, formations. Accès personnel et équipements.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Modules : Dashboard, Connect, Personnel, Équipements, HSE
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">SUPERVISEUR</Badge>
                        <span className="text-sm font-medium">Superviseur</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Supervision équipes, validation visites, suivi équipements.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Modules : Dashboard, Connect, Personnel, Visites, Équipements
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">RECEP</Badge>
                        <span className="text-sm font-medium">Réceptionniste</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Accueil visiteurs, gestion courrier et colis. Point d'entrée principal.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Modules : Dashboard, Connect, Visites, Colis
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">COMMUNICATION</Badge>
                        <span className="text-sm font-medium">Communication</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gestion contenu SOGARA Connect, actualités et événements.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Modules : Dashboard, Connect (édition)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">EMPLOYE</Badge>
                        <span className="text-sm font-medium">Employé</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Accès consultation : tableau de bord et SOGARA Connect uniquement.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Modules : Dashboard, Connect (lecture)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Système de Permissions Détaillé
              </CardTitle>
              <CardDescription>
                Matrice complète des permissions par rôle et explication du système d'autorisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <Card className="p-4 bg-slate-50 dark:bg-slate-950">
                  <h3 className="font-semibold mb-3">🔐 Logique d'Autorisation</h3>
                  <div className="space-y-3 text-sm">
                    <p><strong>Fonction principale :</strong> <code>hasAnyRole(requiredRoles)</code></p>
                    <p className="text-muted-foreground">
                      Chaque navigation et action est protégée par une vérification des rôles.
                      L'utilisateur doit posséder au moins un des rôles requis pour accéder à une fonction.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <code className="text-xs">
                        {`// Exemple : Navigation Personnel
if (hasAnyRole(['ADMIN', 'HSE', 'SUPERVISEUR'])) {
  // Afficher le menu Personnel
} else {
  // Masquer l'option
}`}
                      </code>
                    </div>
                  </div>
                </Card>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-gray-300 p-2 text-left">Module / Fonction</th>
                        <th className="border border-gray-300 p-2 text-center">ADMIN</th>
                        <th className="border border-gray-300 p-2 text-center">HSE</th>
                        <th className="border border-gray-300 p-2 text-center">SUPERVISEUR</th>
                        <th className="border border-gray-300 p-2 text-center">RECEP</th>
                        <th className="border border-gray-300 p-2 text-center">COMMUNICATION</th>
                        <th className="border border-gray-300 p-2 text-center">EMPLOYE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Dashboard - Consultation</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-gray-300 p-2 font-medium">SOGARA Connect - Lecture</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">SOGARA Connect - Édition</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-gray-300 p-2 font-medium">Personnel - Consultation</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Personnel - Modification</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-gray-300 p-2 font-medium">Visites - Gestion</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Colis & Courriers</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-gray-300 p-2 font-medium">Équipements</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">HSE - Complet</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-gray-300 p-2 font-medium">Documentation Projet</td>
                        <td className="border border-gray-300 p-2 text-center">✅</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                        <td className="border border-gray-300 p-2 text-center">❌</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4 border-l-4 border-l-red-500">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                      🚨 Rôles Critiques
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <Badge variant="destructive" className="mb-1">ADMIN</Badge>
                        <p className="text-muted-foreground">
                          Accès universel. Responsable de la configuration système, 
                          gestion des utilisateurs et supervision globale.
                        </p>
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">HSE</Badge>
                        <p className="text-muted-foreground">
                          Autorité sécurité. Gestion exclusive des incidents, 
                          formations et conformité réglementaire.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      ⚙️ Rôles Opérationnels
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <Badge variant="outline" className="mb-1">SUPERVISEUR</Badge>
                        <p className="text-muted-foreground">
                          Encadrement terrain. Validation des processus 
                          et coordination entre services.
                        </p>
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">RECEP</Badge>
                        <p className="text-muted-foreground">
                          Interface externe. Point d'entrée pour visiteurs 
                          et gestion logistique du courrier.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-4 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                    ⚠️ Sécurité et Validation
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Principe de moindre privilège :</strong> Chaque utilisateur n'a accès qu'aux fonctions nécessaires à son rôle.</p>
                    <p><strong>Validation en temps réel :</strong> Vérification des permissions à chaque action critique.</p>
                    <p><strong>Traçabilité :</strong> Toutes les actions sont horodatées et associées à l'utilisateur connecté.</p>
                    <p><strong>Escalade :</strong> Système de validation hiérarchique pour les actions sensibles.</p>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Guide d'Implémentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Configuration Initiale</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    <div>• Installation dépendances : npm install</div>
                    <div>• Configuration Tailwind avec tokens personnalisés</div>
                    <div>• Setup des composants Shadcn/ui</div>
                    <div>• Initialisation du contexte global</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Authentification</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    <div>• Login par matricule (simulation)</div>
                    <div>• Vérification rôles via AppContext</div>
                    <div>• Protection des routes par hasRole/hasAnyRole</div>
                    <div>• Persistance session utilisateur</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Gestion des Données</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    <div>• Repositories : couche d'abstraction data</div>
                    <div>• LocalStorage pour persistance</div>
                    <div>• Hooks personnalisés par domaine métier</div>
                    <div>• Actions/Reducers pour mutations d'état</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">4. Navigation & Routing</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    <div>• Navigation basée sur activeTab (Layout)</div>
                    <div>• Filtrage menus selon rôles utilisateur</div>
                    <div>• Composants page par module métier</div>
                    <div>• Gestion état navigation centralisée</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">5. Extensibilité</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    <div>• Ajout nouveau module : créer page + hook + navigation</div>
                    <div>• Nouveaux rôles : étendre UserRole enum</div>
                    <div>• Types métier : interfaces dans src/types</div>
                    <div>• Composants réutilisables : src/components/ui</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Bonnes Pratiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">À Faire ✓</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Utiliser les hooks personnalisés</li>
                    <li>• Respecter la séparation des responsabilités</li>
                    <li>• Typer avec TypeScript</li>
                    <li>• Tester les permissions par rôle</li>
                    <li>• Valider les données d'entrée</li>
                    <li>• Utiliser les tokens de design system</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">À Éviter ✗</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Modifier directement le state global</li>
                    <li>• Logique métier dans les composants UI</li>
                    <li>• Hardcoder les permissions</li>
                    <li>• Ignorer la validation des rôles</li>
                    <li>• Styles inline au lieu du design system</li>
                    <li>• Couplage fort entre modules</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}