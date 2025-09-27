import { HardHat, Users, Package, Calendar, Shield, Settings, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';

export function WelcomePage() {
  const { login } = useAuth();
  const { getEmployeeById } = useEmployees();

  const demoAccounts = [
    {
      id: '3',
      matricule: 'ADM001',
      name: 'Mamadou Sow',
      role: 'Administrateur',
      description: 'Accès complet à tous les modules',
      color: 'bg-destructive text-destructive-foreground',
      icon: Settings,
    },
    {
      id: '4', 
      matricule: 'HSE001',
      name: 'Aïcha Diop',
      role: 'Responsable HSE',
      description: 'Gestion sécurité, incidents et formations',
      color: 'bg-warning text-warning-foreground',
      icon: Shield,
    },
    {
      id: '5',
      matricule: 'SUP001', 
      name: 'Omar Ba',
      role: 'Superviseur',
      description: 'Supervision et rapports',
      color: 'bg-primary text-primary-foreground',
      icon: Users,
    },
    {
      id: '2',
      matricule: 'REC001',
      name: 'Fatou Kane', 
      role: 'Réceptionniste',
      description: 'Accueil visiteurs et gestion colis',
      color: 'bg-accent text-accent-foreground',
      icon: Package,
    },
    {
      id: '1',
      matricule: 'EMP001',
      name: 'Ahmed Diallo',
      role: 'Employé',
      description: 'Accès employé standard',
      color: 'bg-secondary text-secondary-foreground',
      icon: HardHat,
    },
  ];

  const handleDemoLogin = (accountId: string) => {
    const employee = getEmployeeById(accountId);
    if (employee) {
      login(employee);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Gestion du Personnel',
      description: 'Fiches employés, habilitations et compétences',
    },
    {
      icon: Calendar,
      title: 'Contrôle des Visites',
      description: 'Enregistrement et suivi des visiteurs',
    },
    {
      icon: Package,
      title: 'Colis & Courriers',
      description: 'Réception, stockage et remise sécurisée',
    },
    {
      icon: HardHat,
      title: 'Équipements de Travail',
      description: 'Catalogue EPI et affectations',
    },
    {
      icon: Shield,
      title: 'HSE',
      description: 'Sécurité, incidents et formations',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-[var(--shadow-industrial)]">
                <HardHat className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  SOGARA Access
                </h1>
                <p className="text-xl text-muted-foreground">
                  Système de Gestion des Accès
                </p>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Plateforme complète pour la gestion du personnel, des visiteurs, 
              des équipements et de la sécurité sur site industriel.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-16">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Interface moderne</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Données temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Sécurité renforcée</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Accounts Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Accès Démo Rapide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Testez l'application avec différents niveaux d'accès. 
            Cliquez sur un profil pour vous connecter instantanément.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {demoAccounts.map((account) => {
            const Icon = account.icon;
            return (
              <Card key={account.id} className="industrial-card hover:shadow-[var(--shadow-elevated)] transition-all group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${account.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {account.name}
                  </h3>
                  <Badge variant="outline" className="mb-3">
                    {account.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                    {account.description}
                  </p>
                  <Button 
                    className="w-full gradient-primary group-hover:shadow-lg transition-shadow"
                    onClick={() => handleDemoLogin(account.id)}
                  >
                    Tester
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Modules Intégrés
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution complète pour optimiser la gestion opérationnelle 
              de votre site industriel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="industrial-card text-center hover:shadow-[var(--shadow-elevated)] transition-all animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-foreground">SOGARA Access</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Système de gestion des accès pour environnement industriel
          </p>
        </div>
      </footer>
    </div>
  );
}