import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { repositories } from '@/services/repositories';
import { apiService } from '@/services/api.service';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { convex } from '@/lib/convexClient';
import { demoAccounts } from '@/data/demoAccounts';

interface LoginFormProps {
  onBackToHome: () => void;
}

export function LoginForm({ onBackToHome }: LoginFormProps) {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { employees, getEmployeeById } = useEmployees();
  const navigate = useNavigate();

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
    try {
      // 1) Tentative API backend avec mot de passe par défaut
      try {
        const apiStats = await apiService.getApiStats();
        if (apiStats.connected) {
          // Utiliser les mots de passe par défaut des comptes démo
          const defaultPasswords: Record<string, string> = {
            'ADM001': 'Admin123!',
            'HSE001': 'HSE123!',
            'REC001': 'Reception123!',
            'COM001': 'Communication123!',
            'EMP001': 'Employee123!',
            'DG001': 'DG123!',
            'DRH001': 'DRH123!'
          };
          
          const password = defaultPasswords[matricule.toUpperCase()];
          if (password) {
            const response = await apiService.post('/auth/login', { matricule, password }, { skipAuth: true });
            if (response.success && response.data?.user) {
              const user = response.data.user;
              login({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                matricule: user.matricule,
                service: user.service,
                roles: user.roles,
                competences: user.competences || [],
                habilitations: user.habilitations || [],
                email: user.email,
                phone: user.phone,
                status: user.status,
                stats: user.stats || { visitsReceived: 0, packagesReceived: 0, hseTrainingsCompleted: 0 },
                equipmentIds: user.equipmentIds || [],
                createdAt: new Date(user.createdAt || Date.now()),
                updatedAt: new Date(user.updatedAt || Date.now()),
              });
              toast({ title: 'Connexion API réussie', description: `Bienvenue ${user.firstName} ${user.lastName}` });
              return;
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Connexion API échouée:', error);
      }

      // 2) Tente Convex si disponible (tolère les erreurs et continue)
      try {
        const convexResult = await convex.query("auth:loginByMatricule", { matricule });
        if (convexResult) {
          const found = convexResult as any;
          login({
            id: String(found._id ?? found.id ?? found.matricule),
            firstName: found.firstName,
            lastName: found.lastName,
            matricule: found.matricule,
            service: found.service,
            roles: found.roles,
            competences: found.competences,
            habilitations: found.habilitations,
            email: found.email ?? undefined,
            phone: found.phone ?? undefined,
            status: found.status,
            stats: found.stats,
            equipmentIds: found.equipmentIds ?? [],
            createdAt: new Date(found.createdAt ?? Date.now()),
            updatedAt: new Date(found.updatedAt ?? Date.now()),
          });
          toast({ title: 'Connexion Convex réussie', description: `Bienvenue ${found.firstName} ${found.lastName}` });
          return;
        }
      } catch (_) {
        // Ignorer et poursuivre le fallback local
      }

      // 3) Fallback local: comptes démo et seed
      const employee = employees.find(emp => 
        emp.matricule.toLowerCase() === matricule.toLowerCase()
      );
      if (employee) {
        login(employee);
        
        toast({
          title: 'Connexion (démo locale)',
          description: `Bienvenue ${employee.firstName} ${employee.lastName}`,
        });

        // Redirection basée sur le matricule
        const account = demoAccounts.find(acc => acc.matricule === employee.matricule);
        if (account?.defaultRoute) {
          setTimeout(() => {
            navigate(account.defaultRoute);
          }, 200);
        } else {
          setTimeout(() => {
            navigate('/app/dashboard');
          }, 200);
        }
        return;
      }

      toast({
        title: 'Erreur de connexion',
        description: 'Matricule non trouvé.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (accountId: string) => {
    console.log('Demo login clicked for ID:', accountId);
    console.log('Available employees in state:', employees);

    let employee = getEmployeeById(accountId);

    if (!employee) {
      try {
        const all = repositories.employees.getAll();
        console.log('Fetched employees from repository:', all);
        employee = all.find((e) => e.id === accountId);
      } catch (err) {
        console.error('Error fetching employees from repository', err);
      }
    }

    if (employee) {
      login(employee);
      
      toast({
        title: 'Connexion démo',
        description: `Bienvenue ${employee.firstName} ${employee.lastName}`,
      });

      // Redirection vers la route par défaut du compte
      const account = demoAccounts.find(acc => acc.id === accountId);
      if (account?.defaultRoute) {
        setTimeout(() => {
          navigate(account.defaultRoute);
        }, 200);
      } else {
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 200);
      }
    } else {
      toast({
        title: 'Erreur',
        description: "Compte démo non trouvé. Réessayez dans 1 seconde.",
        variant: 'destructive',
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
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white mx-auto">
                <img src={'/Sogara_logo.png'} alt="SOGARA" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
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
              {employees.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  Chargement des comptes démo...
                </div>
              )}
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <div
                    key={account.id}
                    className={`p-4 rounded-lg border border-border bg-card transition-all group cursor-pointer hover:bg-muted/30`}
                    onClick={() => handleDemoLogin(account.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${account.colorClass} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">
                            {account.fullName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {account.matricule}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-primary mb-1">
                          {account.jobTitle}
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