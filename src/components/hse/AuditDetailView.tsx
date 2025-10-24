import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  FileCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  FileText,
  Eye
} from 'lucide-react';
import type { HSEAudit } from '@/types';

interface AuditDetailViewProps {
  audit: HSEAudit;
  onClose: () => void;
  auditor: string;
  onUpdate?: (audit: HSEAudit) => void;
}

export default function AuditDetailView({ audit, onClose, auditor, onUpdate }: AuditDetailViewProps) {
  const [showFindingDialog, setShowFindingDialog] = useState(false);
  const [newFinding, setNewFinding] = useState({
    category: '',
    severity: 'low',
    description: '',
    evidence: [] as string[],
    nonconformity: false,
    requiredAction: ''
  });

  const getTypeColor = (type: string) => {
    const colors = {
      'internal': 'bg-blue-100 text-blue-800',
      'scheduled': 'bg-purple-100 text-purple-800',
      'emergency': 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'reported': 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleAddFinding = async () => {
    try {
      const response = await fetch(`/api/hse/audits/${audit.id}/findings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newFinding)
      });

      if (response.ok) {
        const updatedAudit = await response.json();
        onUpdate?.(updatedAudit.data);
        setShowFindingDialog(false);
        setNewFinding({
          category: '',
          severity: 'low',
          description: '',
          evidence: [],
          nonconformity: false,
          requiredAction: ''
        });
      }
    } catch (error) {
      console.error('Error adding finding:', error);
    }
  };

  const handleCloseFinding = async (findingId: string) => {
    try {
      const response = await fetch(`/api/hse/audits/${audit.id}/findings/${findingId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const updatedAudit = await response.json();
        onUpdate?.(updatedAudit.data);
      }
    } catch (error) {
      console.error('Error closing finding:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`/api/hse/audits/${audit.id}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Handle report generation result
        console.log('Report generated:', result);
        onUpdate?.(result.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{audit.title}</h2>
          <div className="flex gap-2 mb-4">
            <Badge className={getTypeColor(audit.type)}>
              {audit.type.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(audit.status)}>
              {audit.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">{audit.code}</Badge>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Audit Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Informations générales
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Portée:</strong> {audit.scope}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Date planifiée:</strong> {new Date(audit.schedule?.plannedDate || audit.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Durée:</strong> {audit.schedule?.duration || 0} heures</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Auditeur:</strong> {audit.auditedBy}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Standards et résultats
          </h3>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Standards audités:</strong>
              <div className="mt-1">
                {audit.standards?.map((standard, idx) => (
                  <Badge key={idx} variant="outline" className="mr-1 mb-1">
                    {standard}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm">
              <strong>Constats:</strong> {audit.findings?.length || 0}
            </div>
            <div className="text-sm">
              <strong>Non-conformités:</strong> {audit.findings?.filter(f => f.nonconformity).length || 0}
            </div>
            {audit.reportGenerated && (
              <div className="text-sm">
                <strong>Rapport:</strong> 
                <Button variant="link" size="sm" className="p-0 h-auto">
                  <FileText className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Description de l'audit</h3>
        <p className="text-gray-700">{audit.description}</p>
      </Card>

      {/* Findings */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Constats d'audit</h3>
          {audit.status === 'in_progress' && (
            <Button 
              size="sm" 
              onClick={() => setShowFindingDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un constat
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {audit.findings?.map((finding, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(finding.severity)}>
                      {finding.severity.toUpperCase()}
                    </Badge>
                    {finding.nonconformity && (
                      <Badge variant="destructive">NON-CONFORMITÉ</Badge>
                    )}
                    <span className="text-sm font-medium">{finding.category}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                  {finding.requiredAction && (
                    <p className="text-sm text-gray-600">
                      <strong>Action requise:</strong> {finding.requiredAction}
                    </p>
                  )}
                  {finding.evidence && finding.evidence.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Preuves:</p>
                      <div className="flex gap-2 mt-1">
                        {finding.evidence.map((evidence, evidenceIdx) => (
                          <Button key={evidenceIdx} variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Preuve {evidenceIdx + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {finding.status === 'open' && audit.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCloseFinding(finding.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Fermer
                    </Button>
                  )}
                  {finding.status === 'closed' && (
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Fermé
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!audit.findings || audit.findings.length === 0) && (
            <p className="text-gray-500 text-sm">Aucun constat défini</p>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        {audit.status === 'completed' && !audit.reportGenerated && (
          <Button onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Générer rapport
          </Button>
        )}
        {audit.status === 'planned' && (
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Commencer l'audit
          </Button>
        )}
      </div>

      {/* Add Finding Dialog */}
      {showFindingDialog && (
        <Dialog open={showFindingDialog} onOpenChange={setShowFindingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un constat d'audit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={newFinding.category}
                  onChange={(e) => setNewFinding({...newFinding, category: e.target.value})}
                  placeholder="Ex: Sécurité, Environnement, Qualité"
                />
              </div>
              <div>
                <Label htmlFor="severity">Gravité</Label>
                <Select value={newFinding.severity} onValueChange={(value) => setNewFinding({...newFinding, severity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFinding.description}
                  onChange={(e) => setNewFinding({...newFinding, description: e.target.value})}
                  placeholder="Décrire le constat observé..."
                />
              </div>
              <div>
                <Label htmlFor="requiredAction">Action requise</Label>
                <Textarea
                  id="requiredAction"
                  value={newFinding.requiredAction}
                  onChange={(e) => setNewFinding({...newFinding, requiredAction: e.target.value})}
                  placeholder="Décrire l'action corrective requise..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="nonconformity"
                  checked={newFinding.nonconformity}
                  onChange={(e) => setNewFinding({...newFinding, nonconformity: e.target.checked})}
                />
                <Label htmlFor="nonconformity">Non-conformité</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFindingDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddFinding}>
                Ajouter le constat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}