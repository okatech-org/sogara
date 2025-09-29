import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HSELoadingStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function HSELoadingState({ loading, error, onRetry, children }: HSELoadingStateProps) {
  if (loading) {
    return (
      <Card className="industrial-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-lg font-medium mb-2">Chargement en cours</h3>
            <p className="text-muted-foreground">
              Initialisation des données HSE...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erreur: {error}
          </AlertDescription>
        </Alert>
        {onRetry && (
          <div className="flex justify-center">
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
