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
import { useEmployees } from '@/hooks/useEmployees';
import { usePackages } from '@/hooks/usePackages';
import { Priority } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

export function CreatePackageDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { employees } = useEmployees();
  const { createPackage } = usePackages();

  const [reference, setReference] = useState('');
  const [sender, setSender] = useState('');
  const [recipientEmployeeId, setRecipientEmployeeId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');

  const onSubmit = async () => {
    if (!reference || !sender || !recipientEmployeeId) {
      toast({ title: 'Champs requis', description: 'Référence, Expéditeur et Destinataire sont obligatoires.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await createPackage({
        type: 'package',
        reference,
        sender,
        recipientEmployeeId,
        recipientService: undefined,
        description,
        photoUrl: undefined,
        priority,
        status: 'received',
        receivedAt: new Date(),
        deliveredAt: undefined,
        deliveredBy: undefined,
        signature: undefined,
        isConfidential: undefined,
        scannedFileUrls: undefined,
      } as any);
      setIsOpen(false);
      setReference('');
      setSender('');
      setRecipientEmployeeId('');
      setDescription('');
      setPriority('normal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Package className="w-4 h-4" />
            Nouveau colis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau colis</DialogTitle>
          <DialogDescription>Saisissez les informations du colis reçu.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Référence</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="REF-..." />
            </div>
            <div>
              <Label>Expéditeur</Label>
              <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Nom de l'expéditeur" />
            </div>
            <div className="md:col-span-2">
              <Label>Destinataire (employé)</Label>
              <Select value={recipientEmployeeId} onValueChange={setRecipientEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} — {e.service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes..." />
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


