import { Award, CheckCircle, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AppContext';

export function MesHabilitationsPage() {
  const { currentUser } = useAuth();

  const habilitations = currentUser?.habilitations || [];
  const competences = currentUser?.competences || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          Mes Habilitations & Compétences
        </h1>
        <p className="text-muted-foreground mt-2">
          Qualifications, autorisations et compétences professionnelles
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Habilitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{habilitations.length}</div>
            <p className="text-xs text-muted-foreground">Autorisations actives</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{competences.length}</div>
            <p className="text-xs text-muted-foreground">Domaines maîtrisés</p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500 text-lg px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Actif
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Toutes habilitations valides</p>
          </CardContent>
        </Card>
      </div>

      {/* Mes Habilitations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Habilitations Sécurité</h2>
        {habilitations.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucune habilitation enregistrée</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habilitations.map((hab, index) => (
              <Card key={index} className="industrial-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{hab}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Valide indéfiniment</span>
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        Habilitation active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mes Compétences */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compétences Professionnelles</h2>
        {competences.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucune compétence enregistrée</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competences.map((comp, index) => (
              <Card key={index} className="industrial-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{comp}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        Maîtrisée
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Informations */}
      <Card className="industrial-card bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Informations Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Les habilitations sont liées à vos formations HSE complétées</p>
          <p>• Certaines habilitations nécessitent un renouvellement périodique</p>
          <p>• En cas de doute, contactez le service HSE</p>
          <p>• Conservez vos certificats de formation à jour</p>
        </CardContent>
      </Card>
    </div>
  );
}

