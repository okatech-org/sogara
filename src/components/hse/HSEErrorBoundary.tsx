import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class HSEErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('HSE Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                Erreur du Système HSE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Une erreur inattendue s'est produite dans le module HSE. 
                  L'équipe technique a été automatiquement notifiée.
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-red-800">Détails de l'erreur (Dev Mode)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-red-700 overflow-auto">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </Button>
                
                <Button variant="outline" onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </Button>
                
                <Button variant="ghost" onClick={() => window.location.href = '/app/dashboard'} className="gap-2">
                  <Home className="w-4 h-4" />
                  Retour accueil
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Si le problème persiste :</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Contactez le support technique</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Essayez de vider le cache de votre navigateur</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
