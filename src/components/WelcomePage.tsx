import { HardHat, Users, Package, Calendar, Shield, CheckCircle, ArrowRight, Play, Clock, Award, Zap, Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import techniciensImage from '@/assets/techniciens-raffinerie.jpg';
import ingenieurImage from '@/assets/ingenieur-hse.jpg';
import superviseurImage from '@/assets/superviseur-equipe.jpg';
import gainTempsImage from '@/assets/gain-temps.jpg';
import securiteImage from '@/assets/securite-renforcee.jpg';
import suiviImage from '@/assets/suivi-simplifie.jpg';
import communicationImage from '@/assets/communication-fluide.jpg';
import reconnaissanceImage from '@/assets/reconnaissance.jpg';
import efficaciteImage from '@/assets/efficacite-quotidienne.jpg';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { toast } from '@/hooks/use-toast';
interface WelcomePageProps {
  onShowLogin: () => void;
}

export function WelcomePage({ onShowLogin }: WelcomePageProps) {
  const avantagesPersonnel = [
    {
      icon: Clock,
      title: 'Gagnez du temps',
      description: 'Fini les démarches papier et les allers-retours. Tout se fait en quelques clics.',
      benefice: 'Plus de temps pour vous concentrer sur votre travail',
      image: gainTempsImage
    },
    {
      icon: Shield,
      title: 'Sécurité renforcée', 
      description: 'Suivi automatique des formations HSE et alertes de sécurité personnalisées.',
      benefice: 'Votre sécurité et celle de vos collègues',
      image: securiteImage
    },
    {
      icon: CheckCircle,
      title: 'Suivi simplifié',
      description: 'Visualisez vos colis, vos formations et vos équipements en temps réel.',
      benefice: 'Plus de perte ou d\'oubli important',
      image: suiviImage
    },
    {
      icon: Users,
      title: 'Communication fluide',
      description: 'Recevez les visiteurs plus efficacement et coordonnez vos équipes.',
      benefice: 'Moins de stress, plus de professionnalisme',
      image: communicationImage
    },
    {
      icon: Award,
      title: 'Reconnaissance',
      description: 'Vos compétences et habilitations sont mieux valorisées et trackées.',
      benefice: 'Évolution de carrière facilitée',
      image: reconnaissanceImage
    },
    {
      icon: Zap,
      title: 'Efficacité quotidienne',
      description: 'Interface moderne et intuitive conçue pour votre usage quotidien.',
      benefice: 'Moins de formation nécessaire',
      image: efficaciteImage
    }
  ];

  const temoignages = [
    {
      nom: 'Pierre ANTCHOUET',
      poste: 'Technicien Production',
      temoignage: "SOGARA Access m'évite les paperasses. Je vois directement mes EPI et mes formations à jour.",
      image: techniciensImage
    },
    {
      nom: 'Marie LAKIBI', 
      poste: 'Responsable HSE',
      temoignage: "Enfin un système qui centralise tout ! Les rapports d'incidents et le suivi formation, tout y est.",
      image: ingenieurImage
    },
    {
      nom: 'Christian ELLA',
      poste: 'Superviseur',
      temoignage: "Je pilote mon équipe plus facilement. Visibilité totale sur les affectations et la conformité.",
      image: superviseurImage
    }
  ];

  const demoAccounts = [
    {
      id: '3',
      matricule: 'ADM001',
      name: 'Alain OBAME',
      role: 'Administrateur',
      description: 'Accès complet à tous les modules',
      color: 'bg-destructive text-destructive-foreground',
      icon: Settings,
    },
    {
      id: '4',
      matricule: 'HSE001',
      name: 'Marie LAKIBI',
      role: 'Responsable HSE',
      description: 'Gestion sécurité, incidents et formations',
      color: 'bg-secondary text-secondary-foreground',
      icon: Shield,
    },
    {
      id: '5',
      matricule: 'SUP001',
      name: 'Christian ELLA',
      role: 'Superviseur',
      description: 'Supervision et rapports',
      color: 'bg-primary text-primary-foreground',
      icon: Users,
    },
    {
      id: '2',
      matricule: 'REC001',
      name: 'Sylvie KOUMBA',
      role: 'Réceptionniste',
      description: 'Accueil visiteurs et gestion colis',
      color: 'bg-accent text-accent-foreground',
      icon: Package,
    },
    {
      id: '1',
      matricule: 'EMP001',
      name: 'Pierre ANTCHOUET',
      role: 'Employé',
      description: 'Accès employé standard',
      color: 'bg-secondary text-secondary-foreground',
      icon: HardHat,
    },
  ];

  const { login } = useAuth();
  const handleDemoLogin = (accountId: string) => {
    try {
      const all = repositories.employees.getAll();
      const employee = all.find((e) => e.id === accountId);
      if (employee) {
        login(employee);
        toast({
          title: 'Connexion démo',
          description: `Bienvenue ${employee.firstName} ${employee.lastName}`,
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Compte démo non trouvé.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: "Impossible de charger les comptes démo.",
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${techniciensImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-[var(--shadow-industrial)]">
                <HardHat className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  SOGARA Access
                </h1>
                <p className="text-xl text-primary font-semibold">
                  Votre nouveau portail personnel
                </p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 shadow-[var(--shadow-elevated)]">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Pourquoi SOGARA Access ? 🚀
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong>Cher personnel de SOGARA</strong>, nous avons créé ce portail spécialement pour <strong>vous</strong>. 
                Fini les complications ! SOGARA Access simplifie votre quotidien professionnel et vous fait gagner un temps précieux.
              </p>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="gradient-primary text-lg px-8 py-6 shadow-[var(--shadow-industrial)] hover:shadow-[var(--shadow-elevated)] transition-all"
                onClick={onShowLogin}
              >
                <Play className="w-5 h-5 mr-2" />
                Découvrir mon espace
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Accès Démo immédiat */}
      <div className="py-10">
        <div className="container mx-auto px-4">
          <Card className="industrial-card-elevated">
            <CardHeader>
              <CardTitle className="text-center">Accès Démo immédiat</CardTitle>
              <p className="text-center text-muted-foreground">
                Cliquez sur un profil pour vous connecter instantanément
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {demoAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <div
                      key={account.id}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all group cursor-pointer"
                      onClick={() => handleDemoLogin(account.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">
                              {account.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {account.matricule}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-primary mb-1">
                            {account.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {account.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avantages Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ce que SOGARA Access vous apporte concrètement
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              <strong>6 raisons</strong> pour lesquelles vos collègues utilisent déjà SOGARA Access au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avantagesPersonnel.map((avantage, index) => {
              const Icon = avantage.icon;
              return (
                <Card key={index} className="industrial-card hover:shadow-[var(--shadow-elevated)] transition-all animate-slide-up overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={avantage.image} 
                      alt={avantage.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{avantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      {avantage.description}
                    </p>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-success">
                        ✓ {avantage.benefice}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Vos collègues témoignent
            </h2>
            <p className="text-muted-foreground">
              Découvrez comment SOGARA Access améliore leur quotidien professionnel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {temoignages.map((temoignage, index) => (
              <Card key={index} className="industrial-card-elevated overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={temoignage.image} 
                    alt={`${temoignage.nom} - ${temoignage.poste}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <blockquote className="text-muted-foreground italic mb-4">
                    "{temoignage.temoignage}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground">{temoignage.nom}</p>
                    <p className="text-sm text-primary">{temoignage.poste}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Actions concrètes */}
      <div className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Que pouvez-vous faire avec SOGARA Access ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="industrial-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Pour tous les employés</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Consulter vos formations HSE en cours</li>
                    <li>• Voir vos équipements affectés (EPI)</li>
                    <li>• Suivre vos colis et courriers</li>
                    <li>• Vérifier vos habilitations</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="industrial-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Réceptionnistes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Enregistrer les visiteurs rapidement</li>
                    <li>• Gérer les colis/courriers</li>
                    <li>• Imprimer les badges visiteurs</li>
                    <li>• Notifier les hôtes automatiquement</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="industrial-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Équipe HSE</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Déclarer et suivre les incidents</li>
                    <li>• Organiser les formations sécurité</li>
                    <li>• Contrôler la conformité EPI</li>
                    <li>• Générer des rapports HSE</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="industrial-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Superviseurs</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Superviser les équipes</li>
                    <li>• Valider les affectations</li>
                    <li>• Consulter les rapports globaux</li>
                    <li>• Contrôler la conformité</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Prêt à simplifier votre quotidien ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez vos collègues qui utilisent déjà SOGARA Access et découvrez 
            un nouveau niveau d'efficacité dans votre travail quotidien.
          </p>
          
          <Button 
            size="lg"
            className="gradient-primary text-lg px-8 py-6 shadow-[var(--shadow-industrial)]"
            onClick={onShowLogin}
          >
            <Play className="w-5 h-5 mr-2" />
            Commencer maintenant
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Accès immédiat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Support technique disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Formation incluse</span>
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
              <span className="text-muted-foreground">- Pour le personnel, par le personnel</span>
            </div>
            <div className="text-center md:text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={onShowLogin}
              >
                Accéder à mon espace →
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}