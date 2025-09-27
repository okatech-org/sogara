import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AppContext';
import { useEmployees } from '@/hooks/useEmployees';
import { HardHat } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function LoginForm() {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { employees } = useEmployees();

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

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <Card className="industrial-card-elevated w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">SOGARA Access</CardTitle>
            <p className="text-muted-foreground mt-2">
              Gestion des Accès & Personnel
            </p>
          </div>
        </CardHeader>
        <CardContent>
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

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs">
              <p><code className="bg-primary/10 px-2 py-1 rounded">EMP001</code> - Ahmed Diallo (Employé)</p>
              <p><code className="bg-primary/10 px-2 py-1 rounded">REC001</code> - Fatou Kane (Réceptionniste)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}