import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, AlertTriangle, CheckCircle, Clock, Users, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditItem {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'certification';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  date: string;
  auditor: string;
  scope: string;
  findings: number;
  nonConformities: number;
}

interface ComplianceItem {
  id: string;
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'under_review';
  lastCheck: string;
  nextReview: string;
  responsible: string;
}

interface NonConformityItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  date: string;
  responsible: string;
  dueDate: string;
  actions: number;
}

export default function ConformitePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('audits');

  // Données de démonstration
  const audits: AuditItem[] = [
    {
      id: '1',
      title: 'Audit ISO 45001 - Sécurité',
      type: 'internal',
      status: 'completed',
      date: '2024-10-15',
      auditor: 'Lié Orphé BOURDES',
      scope: 'Système de management HSE',
      findings: 3,
      nonConformities: 1
    },
    {
      id: '2',
      title: 'Audit ISO 14001 - Environnement',
      type: 'external',
      status: 'in_progress',
      date: '2024-10-20',
      auditor: 'Bureau Veritas',
      scope: 'Gestion environnementale',
      findings: 0,
      nonConformities: 0
    },
    {
      id: '3',
      title: 'Audit ISO 9001 - Qualité',
      type: 'certification',
      status: 'planned',
      date: '2024-11-10',
      auditor: 'AFNOR',
      scope: 'Système qualité',
      findings: 0,
      nonConformities: 0
    }
  ];

  const complianceItems: ComplianceItem[] = [
    {
      id: '1',
      regulation: 'Code du Travail Gabonais',
      requirement: 'Formation sécurité obligatoire',
      status: 'compliant',
      lastCheck: '2024-10-01',
      nextReview: '2025-01-01',
      responsible: 'Lise Véronique DITSOUGOU'
    },
    {
      id: '2',
      regulation: 'ISO 45001',
      requirement: 'Plan d\'urgence',
      status: 'under_review',
      lastCheck: '2024-09-15',
      nextReview: '2024-11-15',
      responsible: 'Lié Orphé BOURDES'
    },
    {
      id: '3',
      regulation: 'ISO 14001',
      requirement: 'Gestion des déchets',
      status: 'non_compliant',
      lastCheck: '2024-10-10',
      nextReview: '2024-10-25',
      responsible: 'Pierrette NOMSI'
    }
  ];

  const nonConformities: NonConformityItem[] = [
    {
      id: '1',
      title: 'Plan d\'urgence non mis à jour',
      severity: 'high',
      status: 'in_progress',
      date: '2024-10-15',
      responsible: 'Lié Orphé BOURDES',
      dueDate: '2024-11-15',
      actions: 2
    },
    {
      id: '2',
      title: 'Formation sécurité retardée',
      severity: 'medium',
      status: 'open',
      date: '2024-10-18',
      responsible: 'Lise Véronique DITSOUGOU',
      dueDate: '2024-11-01',
      actions: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'compliant':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
      case 'non_compliant':
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Conformité & Audits</h1>
          <p className="text-muted-foreground mt-2">
            Gestion de la conformité réglementaire et des audits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground">Module Conformité</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audits Planifiés</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformité</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non-Conformités</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions en Cours</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audits">Audits & Inspections</TabsTrigger>
          <TabsTrigger value="compliance">Veille Réglementaire</TabsTrigger>
          <TabsTrigger value="nonconformities">Non-Conformités</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        {/* Audits & Inspections */}
        <TabsContent value="audits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Audits & Inspections</h2>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Nouvel Audit
            </Button>
          </div>

          <div className="grid gap-4">
            {audits.map((audit) => (
              <Card key={audit.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{audit.title}</h3>
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status === 'in_progress' ? 'En cours' :
                           audit.status === 'completed' ? 'Terminé' :
                           audit.status === 'planned' ? 'Planifié' : 'En retard'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Auditeur:</strong> {audit.auditor} | <strong>Date:</strong> {audit.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Périmètre:</strong> {audit.scope}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>🔍 {audit.findings} constats</span>
                        <span>⚠️ {audit.nonConformities} non-conformités</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Veille Réglementaire */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Veille Réglementaire</h2>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Ajouter Exigence
            </Button>
          </div>

          <div className="grid gap-4">
            {complianceItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.regulation}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'compliant' ? 'Conforme' :
                           item.status === 'non_compliant' ? 'Non conforme' : 'En révision'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Exigence:</strong> {item.requirement}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsable:</strong> {item.responsible}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>📅 Dernière vérification: {item.lastCheck}</span>
                        <span>🔄 Prochaine révision: {item.nextReview}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Non-Conformités */}
        <TabsContent value="nonconformities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Non-Conformités</h2>
            <Button>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Nouvelle NC
            </Button>
          </div>

          <div className="grid gap-4">
            {nonConformities.map((nc) => (
              <Card key={nc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{nc.title}</h3>
                        <Badge className={getSeverityColor(nc.severity)}>
                          {nc.severity === 'critical' ? 'Critique' :
                           nc.severity === 'high' ? 'Élevée' :
                           nc.severity === 'medium' ? 'Moyenne' : 'Faible'}
                        </Badge>
                        <Badge className={getStatusColor(nc.status)}>
                          {nc.status === 'open' ? 'Ouverte' :
                           nc.status === 'in_progress' ? 'En cours' :
                           nc.status === 'resolved' ? 'Résolue' : 'Fermée'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Responsable:</strong> {nc.responsible} | <strong>Date:</strong> {nc.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Échéance:</strong> {nc.dueDate} | <strong>Actions:</strong> {nc.actions}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reporting */}
        <TabsContent value="reporting" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reporting</h2>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Générer Rapport
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rapports Disponibles</CardTitle>
                <CardDescription>Modèles de rapports prédéfinis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport Audit ISO 45001
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Bilan Conformité Mensuel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Suivi Non-Conformités
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rapports Générés</CardTitle>
                <CardDescription>Historique des rapports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">Rapport Octobre 2024</p>
                    <p className="text-sm text-muted-foreground">Généré le 15/10/2024</p>
                  </div>
                  <Button variant="outline" size="sm">Télécharger</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">Audit ISO 45001</p>
                    <p className="text-sm text-muted-foreground">Généré le 10/10/2024</p>
                  </div>
                  <Button variant="outline" size="sm">Télécharger</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}