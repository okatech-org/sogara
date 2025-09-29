import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AppContext';

interface Audit {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'regulatory';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  scheduledDate: Date;
  auditor: string;
  scope: string[];
  score?: number;
  findings: number;
  criticalFindings: number;
}

export function HSEAuditDashboard() {
  const { hasAnyRole } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  const canManageAudits = hasAnyRole(['ADMIN', 'HSE']);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      // Simuler des données d'audit
      const mockAudits: Audit[] = [
        {
          id: '1',
          title: 'Audit Interne HSE Q1 2025',
          type: 'internal',
          status: 'completed',
          scheduledDate: new Date('2025-03-15'),
          auditor: 'Marie LAKIBI',
          scope: ['Formations', 'EPI', 'Incidents'],
          score: 87,
          findings: 12,
          criticalFindings: 2
        },
        {
          id: '2',
          title: 'Inspection Réglementaire Ministère',
          type: 'regulatory',
          status: 'planned',
          scheduledDate: new Date('2025-06-20'),
          auditor: 'Inspection du Travail',
          scope: ['Conformité', 'Documentation', 'Formations'],
          findings: 0,
          criticalFindings: 0
        },
        {
          id: '3',
          title: 'Audit ISO 14001 - Environnement',
          type: 'external',
          status: 'in_progress',
          scheduledDate: new Date('2025-04-10'),
          auditor: 'Bureau Veritas',
          scope: ['Management Environnemental', 'Déchets', 'Émissions'],
          findings: 5,
          criticalFindings: 0
        }
      ];
      
      setAudits(mockAudits);
    } catch (error) {
      console.error('Erreur chargement audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuditStats = () => {
    const completed = audits.filter(a => a.status === 'completed').length;
    const planned = audits.filter(a => a.status === 'planned').length;
    const inProgress = audits.filter(a => a.status === 'in_progress').length;
    const overdue = audits.filter(a => a.status === 'overdue').length;
    
    const averageScore = audits
      .filter(a => a.score !== undefined)
      .reduce((sum, a) => sum + (a.score || 0), 0) / 
      Math.max(audits.filter(a => a.score !== undefined).length, 1);

    const totalFindings = audits.reduce((sum, a) => sum + a.findings, 0);
    const criticalFindings = audits.reduce((sum, a) => sum + a.criticalFindings, 0);

    return {
      total: audits.length,
      completed,
      planned,
      inProgress,
      overdue,
      averageScore: Math.round(averageScore),
      totalFindings,
      criticalFindings
    };
  };

  const stats = getAuditStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'planned': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'planned': return 'Planifié';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'internal': return 'Interne';
      case 'external': return 'Externe';
      case 'regulatory': return 'Réglementaire';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'default';
      case 'external': return 'secondary';
      case 'regulatory': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des audits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <Progress value={stats.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audits terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgress} en cours
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Constats total</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFindings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalFindings} critiques
            </p>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audits planifiés</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue} en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des audits */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Audits et Contrôles HSE
            </CardTitle>
            {canManageAudits && (
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Planifier audit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun audit en cours</h3>
              <p className="text-muted-foreground">
                Planifiez votre premier audit HSE
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {audits.map((audit) => (
                <Card key={audit.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{audit.title}</h3>
                          <Badge variant={getTypeColor(audit.type)}>
                            {getTypeLabel(audit.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Auditeur: {audit.auditor}</span>
                          <span>Date: {audit.scheduledDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Périmètre:</span>
                          {audit.scope.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <StatusBadge 
                          status={getStatusLabel(audit.status)} 
                          variant={getStatusColor(audit.status)}
                        />
                        {audit.score !== undefined && (
                          <div className="text-lg font-bold text-primary">
                            {audit.score}%
                          </div>
                        )}
                      </div>
                    </div>

                    {audit.findings > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{audit.findings}</div>
                          <div className="text-sm text-muted-foreground">Constats total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{audit.criticalFindings}</div>
                          <div className="text-sm text-muted-foreground">Constats critiques</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Rapport
                      </Button>
                      {audit.status === 'completed' && (
                        <Button size="sm" variant="outline" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Plan d'action
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
