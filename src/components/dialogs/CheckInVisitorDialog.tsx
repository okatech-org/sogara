import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Visit, Visitor, Employee } from '@/types';
import { LogIn, User, Building, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useVisits } from '@/hooks/useVisits';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CheckInVisitorDialogProps {
  visit: Visit;
  visitor: Visitor;
  hostEmployee: Employee;
  trigger?: React.ReactNode;
  onSuccess?: (visit: Visit) => void;
}

export function CheckInVisitorDialog({ 
  visit, 
  visitor, 
  hostEmployee, 
  trigger, 
  onSuccess 
}: CheckInVisitorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [badgeNumber, setBadgeNumber] = useState(visit.badgeNumber || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateVisitStatus } = useVisits();

  const handleCheckIn = async () => {
    if (!badgeNumber.trim()) {
      toast({
        title: 'Badge requis',
        description: 'Veuillez attribuer un numéro de badge',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedVisit = await updateVisitStatus(visit.id, 'in_progress', {
        badgeNumber,
        notes,
      });
      if (updatedVisit) {
        setIsOpen(false);
        onSuccess?.(updatedVisit);

        toast({
          title: 'Visiteur enregistré',
          description: `${visitor.firstName} ${visitor.lastName} est maintenant sur site`
        });
      }

    } catch (error) {
      console.error('Erreur check-in:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'entrée',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <LogIn className="w-4 h-4" />
            Check-in
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Enregistrer l'arrivée
          </DialogTitle>
          <DialogDescription>
            Confirmez l'arrivée du visiteur et attribuez-lui un badge d'accès.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations visiteur */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {visitor.firstName} {visitor.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      {visitor.company}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p><strong>Document:</strong> {visitor.idDocument} ({visitor.documentType.toUpperCase()})</p>
                    {visitor.phone && <p><strong>Téléphone:</strong> {visitor.phone}</p>}
                    {visitor.email && <p><strong>Email:</strong> {visitor.email}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Détails de la visite */}
          <div className="space-y-3">
            <h4 className="font-medium">Détails de la visite</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  <strong>Programmée:</strong> {format(visit.scheduledAt, "EEEE d MMMM yyyy", { locale: fr })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  <strong>Heure:</strong> {format(visit.scheduledAt, "HH:mm")}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>
                  <strong>Hôte:</strong> {hostEmployee.firstName} {hostEmployee.lastName}
                </span>
              </div>
              
              <div>
                <Badge variant="outline">
                  {hostEmployee.service}
                </Badge>
              </div>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm">
                <strong>Objet:</strong> {visit.purpose}
              </p>
            </div>
          </div>

          <Separator />

          {/* Attribution badge */}
          <div className="space-y-4">
            <h4 className="font-medium">Attribution du badge</h4>
            
            <div className="space-y-2">
              <Label htmlFor="badgeNumber">Numéro de badge *</Label>
              <Input
                id="badgeNumber"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="Ex: B001, V-123"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Le badge doit être remis au visiteur et récupéré à sa sortie.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations supplémentaires..."
              />
            </div>
          </div>

          {/* Résumé de l'action */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600">Action à effectuer</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Le visiteur <strong>{visitor.firstName} {visitor.lastName}</strong> va être 
                enregistré comme <strong>présent sur site</strong> avec le badge <strong>{badgeNumber || '[À définir]'}</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
            
            <Button
              onClick={handleCheckIn}
              disabled={isLoading || !badgeNumber.trim()}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Enregistrement...' : 'Confirmer l\'entrée'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
