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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="implementation">Implémentation</TabsTrigger>
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
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Personnel</h3>
                        <p className="text-sm text-muted-foreground">
                          Gestion des employés, compétences, habilitations et statistiques
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Calendar className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Visites</h3>
                        <p className="text-sm text-muted-foreground">
                          Planification, accueil et suivi des visiteurs externes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Package className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Colis & Courriers</h3>
                        <p className="text-sm text-muted-foreground">
                          Réception, stockage et distribution du courrier
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <HardHat className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Équipements</h3>
                        <p className="text-sm text-muted-foreground">
                          Inventaire, attribution et maintenance préventive
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Shield className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">HSE</h3>
                        <p className="text-sm text-muted-foreground">
                          Sécurité, incidents, formations et conformité
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Newspaper className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">SOGARA Connect</h3>
                        <p className="text-sm text-muted-foreground">
                          Communication interne, actualités et événements
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Settings className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Dashboard</h3>
                        <p className="text-sm text-muted-foreground">
                          Tableau de bord avec KPI et statistiques temps réel
                        </p>
                      </div>
                    </div>
                  </div>
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