import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { useEquipment } from '@/hooks/useEquipment';
import { HardHat, User } from 'lucide-react';

export function AssignEquipmentDialog({ equipmentId, trigger }: { equipmentId: string; trigger?: React.ReactNode }) {
  const { employees } = useEmployees();
  const { assignEquipment } = useEquipment();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('');

  const sorted = useMemo(() => employees.slice().sort((a, b) => a.lastName.localeCompare(b.lastName)), [employees]);

  const onSubmit = async () => {
    if (!employeeId) return;
    setIsLoading(true);
    try {
      await assignEquipment(equipmentId, employeeId);
      setIsOpen(false);
      setEmployeeId('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full gradient-primary">
            <User className="w-4 h-4" />
            Affecter à un employé
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affecter l'équipement</DialogTitle>
          <DialogDescription>Sélectionnez l'employé détenteur.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un employé" />
            </SelectTrigger>
            <SelectContent>
              {sorted.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.lastName.toUpperCase()} {e.firstName} — {e.service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Annuler</Button>
            <Button onClick={onSubmit} disabled={!employeeId || isLoading}>Valider</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


