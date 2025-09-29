import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, BookOpen, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HSETraining, HSETrainingSession } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HSETrainingCalendarProps {
  trainings: HSETraining[];
  onSessionClick?: (training: HSETraining, session: HSETrainingSession) => void;
  onCreateSession?: () => void;
  canEdit?: boolean;
}

interface SessionWithTraining extends HSETrainingSession {
  training: HSETraining;
}

export function HSETrainingCalendar({ 
  trainings, 
  onSessionClick, 
  onCreateSession, 
  canEdit = false 
}: HSETrainingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  // Récupérer toutes les sessions avec leur formation associée
  const allSessions: SessionWithTraining[] = trainings.flatMap(training =>
    training.sessions.map(session => ({
      ...session,
      training
    }))
  );

  // Filtrer les sessions du mois courant
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthSessions = allSessions.filter(session =>
    session.date >= monthStart && session.date <= monthEnd
  );

  // Générer les jours du mois
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Grouper les sessions par jour
  const sessionsByDay = monthSessions.reduce((acc, session) => {
    const dayKey = format(session.date, 'yyyy-MM-dd');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(session);
    return acc;
  }, {} as Record<string, SessionWithTraining[]>);

  const getStatusColor = (status: HSETrainingSession['status']) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: HSETrainingSession['status']) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const renderMonthView = () => {
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    return (
      <div className="space-y-4">
        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Cases des jours */}
          {monthDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const daySessions = sessionsByDay[dayKey] || [];
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={dayKey}
                className={`min-h-[100px] p-2 border border-border rounded-lg ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {daySessions.slice(0, 2).map(session => (
                    <div
                      key={session.id}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onSessionClick?.(session.training, session)}
                    >
                      <div className="font-medium truncate">
                        {session.training.title}
                      </div>
                      <div className="text-muted-foreground">
                        {format(session.date, 'HH:mm')}
                      </div>
                    </div>
                  ))}
                  
                  {daySessions.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{daySessions.length - 2} autre(s)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const upcomingSessions = allSessions
      .filter(session => session.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);

    if (upcomingSessions.length === 0) {
      return (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Aucune formation programmée</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer une session de formation.
          </p>
          {canEdit && (
            <Button onClick={onCreateSession}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une session
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {upcomingSessions.map(session => (
          <Card 
            key={session.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSessionClick?.(session.training, session)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{session.training.title}</h3>
                    <StatusBadge 
                      status={getStatusLabel(session.status)}
                      variant={getStatusColor(session.status)}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(session.date, 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(session.date, 'HH:mm')} - {session.training.duration}min
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {session.location}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {session.attendance.length}/{session.maxParticipants} participants
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">{session.instructor}</div>
                  <div className="text-xs text-muted-foreground mt-1">Formateur</div>
                </div>
              </div>
              
              {/* Barre de progression des inscriptions */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Inscriptions</span>
                  <span>{session.attendance.length}/{session.maxParticipants}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${(session.attendance.length / session.maxParticipants) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="industrial-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendrier des formations HSE
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Contrôles de vue */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="h-8 px-3"
              >
                Mois
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                Liste
              </Button>
            </div>
            
            {canEdit && (
              <Button onClick={onCreateSession} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle session
              </Button>
            )}
          </div>
        </div>
        
        {viewMode === 'month' && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {viewMode === 'month' ? renderMonthView() : renderListView()}
      </CardContent>
    </Card>
  );
}
