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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEquipment } from '@/hooks/useEquipment';
import { EquipmentStatus } from '@/types';
import { HardHat, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function CreateEquipmentDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { createEquipment } = useEquipment();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [label, setLabel] = useState('');
  const [type, setType] = useState('EPI');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<EquipmentStatus>('operational');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const onSubmit = async () => {
    if (!label || !type) {
      toast({ title: 'Champs requis', description: 'Libellé et Type sont obligatoires.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await createEquipment({
        label,
        type,
        serialNumber: serialNumber || undefined,
        holderEmployeeId: undefined,
        status,
        nextCheckDate: undefined,
        description: description || undefined,
        location: location || undefined,
        history: [],
      } as any);
      setIsOpen(false);
      setLabel('');
      setType('EPI');
      setSerialNumber('');
      setStatus('operational');
      setLocation('');
      setDescription('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Nouvel équipement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un équipement</DialogTitle>
          <DialogDescription>Renseignez les informations de l'équipement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Libellé</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Casque de sécurité" />
            </div>
            <div>
              <Label>Type</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="EPI / Outil / ..." />
            </div>
            <div>
              <Label>N° série (optionnel)</Label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="CSQ001" />
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EquipmentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Opérationnel</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Localisation (optionnel)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zone Production" />
            </div>
            <div className="md:col-span-2">
              <Label>Description (optionnel)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails..." />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Annuler</Button>
            <Button onClick={onSubmit} disabled={isLoading}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
