import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { HardHat, ArrowLeft, ArrowRight, Settings, Shield, Users, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LoginFormProps {
  onBackToHome: () => void;
}

export function LoginForm({ onBackToHome }: LoginFormProps) {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { employees, getEmployeeById } = useEmployees();

  const demoAccounts = [
    {
      id: '3',
      matricule: 'ADM001',
      name: 'ALAIN OBAME',
      role: 'Administrateur',
      description: 'Accès complet à tous les modules',
      color: 'bg-destructive text-destructive-foreground',
      icon: Settings,
    },
    {
      id: '4', 
      matricule: 'HSE001',
      name: 'MARIE LAKIBI',
      role: 'Responsable HSE',
      description: 'Gestion sécurité, incidents et formations',
      color: 'bg-secondary text-secondary-foreground',
      icon: Shield,
    },
    {
      id: '5',
      matricule: 'SUP001', 
      name: 'CHRISTIAN ELLA',
      role: 'Superviseur',
      description: 'Supervision et rapports',
      color: 'bg-primary text-primary-foreground',
      icon: Users,
    },
    {
      id: '2',
      matricule: 'REC001',
      name: 'SYLVIE KOUMBA', 
      role: 'Réceptionniste',
      description: 'Accueil visiteurs et gestion colis',
      color: 'bg-accent text-accent-foreground',
      icon: Package,
    },
    {
      id: '1',
      matricule: 'EMP001',
      name: 'PIERRE ANTCHOUET',
      role: 'Employé',
      description: 'Accès employé standard',
      color: 'bg-secondary text-secondary-foreground',
      icon: HardHat,
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricule.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre matricule.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simuler une authentification
    setTimeout(() => {
      const employee = employees.find(emp => 
        emp.matricule.toLowerCase() === matricule.toLowerCase()
      );

      if (employee) {
        login(employee);
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${employee.firstName} ${employee.lastName}`,
        });
      } else {
        toast({
          title: 'Erreur de connexion',
          description: 'Matricule non trouvé.',
          variant: 'destructive',
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (accountId: string) => {
    const employee = getEmployeeById(accountId);
    if (employee) {
      login(employee);
      toast({
        title: 'Connexion démo',
        description: `Bienvenue ${employee.firstName} ${employee.lastName}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBackToHome}
            className="gap-2 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="industrial-card-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto">
                <HardHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Accédez à votre espace SOGARA Access
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricule">Matricule</Label>
                  <Input
                    id="matricule"
                    type="text"
                    placeholder="Saisissez votre matricule"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    disabled={loading}
                    className="text-center font-mono"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Utilisez un compte de démonstration
              </p>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="industrial-card-elevated">
            <CardHeader>
              <CardTitle className="text-center">Comptes de Démonstration</CardTitle>
              <p className="text-center text-muted-foreground">
                Testez l'application avec différents niveaux d'accès
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}