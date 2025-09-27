import { HardHat, Users, Package, Calendar, Shield, CheckCircle, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WelcomePageProps {
  onShowLogin: () => void;
}

export function WelcomePage({ onShowLogin }: WelcomePageProps) {
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

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg"
                className="gradient-primary text-lg px-8 py-6 shadow-[var(--shadow-industrial)] hover:shadow-[var(--shadow-elevated)] transition-all"
                onClick={onShowLogin}
              >
                <Play className="w-5 h-5 mr-2" />
                Accéder à l'application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-primary/5"
              >
                Découvrir les fonctionnalités
              </Button>
            </div>
          </div>
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

      {/* Benefits Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Pourquoi choisir SOGARA Access ?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Sécurité renforcée</h3>
                    <p className="text-muted-foreground">Contrôle d'accès granulaire et traçabilité complète</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Interface intuitive</h3>
                    <p className="text-muted-foreground">Conçue pour une utilisation simple et efficace</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Conformité HSE</h3>
                    <p className="text-muted-foreground">Respect des normes de sécurité industrielle</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Temps réel</h3>
                    <p className="text-muted-foreground">Suivi instantané de toutes les activités</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="industrial-card text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Employés gérés</p>
              </Card>
              <Card className="industrial-card text-center p-6">
                <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Disponibilité</p>
              </Card>
              <Card className="industrial-card text-center p-6">
                <div className="text-3xl font-bold text-success mb-2">99%</div>
                <p className="text-sm text-muted-foreground">Fiabilité</p>
              </Card>
              <Card className="industrial-card text-center p-6">
                <div className="text-3xl font-bold text-warning mb-2">5min</div>
                <p className="text-sm text-muted-foreground">Prise en main</p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">SOGARA Access</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                Système de gestion des accès pour environnement industriel
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={onShowLogin}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}