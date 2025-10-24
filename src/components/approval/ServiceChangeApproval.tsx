import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface ServiceChange {
  id: string;
  employeeId: string;
  employeeName: string;
  currentService: string;
  newService: string;
  requestedBy: string;
  requestedDate: string;
  effectiveDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ServiceChangeApprovalProps {
  changes: ServiceChange[];
  onApprove: (changeId: string) => void;
  onReject: (changeId: string) => void;
}

export function ServiceChangeApproval({ changes, onApprove, onReject }: ServiceChangeApprovalProps) {
  const pendingChanges = changes.filter(change => change.status === 'pending');

  if (pendingChanges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Validations en Attente (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Aucune validation en attente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Validations en Attente ({pendingChanges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingChanges.map((change) => (
          <div
            key={change.id}
            className="border rounded-lg p-4 bg-muted/30 space-y-3"
          >
            {/* En-tête avec nom et statut */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{change.employeeName}</h4>
                <Badge variant="outline" className="text-xs">
                  {change.status}
                </Badge>
              </div>
            </div>
            
            {/* Informations du changement */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Changement:</strong> {change.currentService} → {change.newService}</p>
              <p><strong>Effectif:</strong> {new Date(change.effectiveDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Demandé par:</strong> {change.requestedBy}</p>
            </div>
            
            {/* Motif */}
            <div className="p-2 bg-muted rounded text-xs">
              <strong>Motif:</strong> {change.reason}
            </div>
            
            {/* Boutons d'action - Mise en page optimisée pour éviter le débordement */}
            <div className="pt-3 border-t">
              <div className="flex justify-end">
                <div className="flex gap-2 w-[200px] max-w-full overflow-hidden">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 justify-center text-xs w-full min-w-0"
                    onClick={() => onReject(change.id)}
                  >
                    <XCircle className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Rejeter</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white justify-center text-xs w-full min-w-0"
                    onClick={() => onApprove(change.id)}
                  >
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Approuver</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
