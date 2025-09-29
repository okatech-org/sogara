import { useState } from 'react';
import { Clock, AlertTriangle, User, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TimelineEvent, HSEIncident } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HSEIncidentTimelineProps {
  incident: HSEIncident;
  onAddUpdate?: (incidentId: string, update: string) => void;
  canEdit?: boolean;
}

// Simuler les événements de timeline basés sur l'incident
function generateTimelineEvents(incident: HSEIncident): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  // Événement de création
  events.push({
    date: incident.createdAt,
    action: 'Incident déclaré',
    user: incident.reportedBy,
    details: `Type: ${incident.type} - Sévérité: ${incident.severity}`
  });

  // Événement d'assignation d'enquêteur (si présent)
  if (incident.investigatedBy) {
    const investigationDate = new Date(incident.createdAt);
    investigationDate.setHours(investigationDate.getHours() + 2); // Simuler 2h après déclaration
    
    events.push({
      date: investigationDate,
      action: 'Enquêteur assigné',
      user: 'Système HSE',
      details: `Enquête confiée à ${incident.investigatedBy}`
    });
  }

  // Événement de résolution (si résolu)
  if (incident.status === 'resolved' && incident.correctiveActions) {
    const resolutionDate = new Date(incident.updatedAt);
    
    events.push({
      date: resolutionDate,
      action: 'Incident résolu',
      user: incident.investigatedBy || incident.reportedBy,
      details: incident.correctiveActions
    });
  }

  // Ajouter des événements simulés pour enrichir la timeline
  if (incident.status === 'investigating') {
    const analysisDate = new Date(incident.createdAt);
    analysisDate.setDate(analysisDate.getDate() + 1);
    
    events.push({
      date: analysisDate,
      action: 'Analyse en cours',
      user: incident.investigatedBy || 'Équipe HSE',
      details: 'Collecte des témoignages et analyse des causes'
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function HSEIncidentTimeline({ incident, onAddUpdate, canEdit = false }: HSEIncidentTimelineProps) {
  const [newUpdate, setNewUpdate] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  
  const timelineEvents = generateTimelineEvents(incident);

  const handleAddUpdate = () => {
    if (newUpdate.trim() && onAddUpdate) {
      onAddUpdate(incident.id, newUpdate.trim());
      setNewUpdate('');
      setIsAddingUpdate(false);
    }
  };

  const getEventIcon = (action: string) => {
    if (action.includes('déclaré')) return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    if (action.includes('assigné')) return <User className="w-4 h-4 text-blue-500" />;
    if (action.includes('résolu')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getStatusColor = (status: HSEIncident['status']) => {
    switch (status) {
      case 'reported': return 'info';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      default: return 'info';
    }
  };

  const getSeverityColor = (severity: HSEIncident['severity']) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'urgent';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de l'incident */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{incident.type}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {incident.occurredAt.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                <span>•</span>
                <span>{incident.location}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <StatusBadge 
                status={incident.status === 'reported' ? 'Signalé' : 
                       incident.status === 'investigating' ? 'En cours' : 'Résolu'}
                variant={getStatusColor(incident.status)}
              />
              <StatusBadge 
                status={incident.severity === 'low' ? 'Faible' :
                       incident.severity === 'medium' ? 'Moyen' : 'Élevé'}
                variant={getSeverityColor(incident.severity)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">{incident.description}</p>
            </div>
            
            {incident.correctiveActions && (
              <div>
                <h4 className="font-medium mb-2">Actions correctives</h4>
                <p className="text-muted-foreground leading-relaxed">{incident.correctiveActions}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium">Déclaré par:</span> {incident.reportedBy}
              </div>
              {incident.investigatedBy && (
                <div>
                  <span className="font-medium">Enquêteur:</span> {incident.investigatedBy}
                </div>
              )}
            </div>

            {incident.attachments && incident.attachments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Pièces jointes</h4>
                <div className="flex flex-wrap gap-2">
                  {incident.attachments.map((attachment, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      📎 Fichier {index + 1}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline des événements */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique de l'incident</CardTitle>
            {canEdit && !isAddingUpdate && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingUpdate(true)}
              >
                Ajouter une mise à jour
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timeline des événements */}
            <div className="relative">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex items-start space-x-4 pb-6">
                  {/* Ligne verticale */}
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border"></div>
                  )}
                  
                  {/* Icône */}
                  <div className="relative flex items-center justify-center w-8 h-8 bg-background border-2 border-border rounded-full">
                    {getEventIcon(event.action)}
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-foreground">{event.action}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(event.date, { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      Par {event.user} • {event.date.toLocaleString('fr-FR')}
                    </div>
                    
                    {event.details && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{event.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire d'ajout de mise à jour */}
            {isAddingUpdate && (
              <div className="relative flex items-start space-x-4 pt-4 border-t">
                <div className="flex items-center justify-center w-8 h-8 bg-background border-2 border-primary rounded-full">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-medium">Nouvelle mise à jour</h4>
                    <p className="text-xs text-muted-foreground">
                      Ajouter des informations sur l'avancement de l'enquête
                    </p>
                  </div>
                  
                  <Textarea
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Décrivez l'évolution de l'incident, les actions entreprises..."
                    className="min-h-[80px]"
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingUpdate(false);
                        setNewUpdate('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddUpdate}
                      disabled={!newUpdate.trim()}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
