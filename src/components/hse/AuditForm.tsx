import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X, Calendar, Clock, MapPin } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function AuditForm({ onSubmit, onCancel }: AuditFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internal',
    scope: '',
    standards: [] as string[],
    plannedDate: '',
    duration: '',
    location: '',
    notes: ''
  });

  const [newStandard, setNewStandard] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addStandard = () => {
    if (newStandard.trim()) {
      setFormData({
        ...formData,
        standards: [...formData.standards, newStandard.trim()]
      });
      setNewStandard('');
    }
  };

  const removeStandard = (index: number) => {
    setFormData({
      ...formData,
      standards: formData.standards.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Titre de l'audit *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type d'audit</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Interne</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="emergency">Urgence</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="scope">Portée de l'audit *</Label>
            <Input
              id="scope"
              value={formData.scope}
              onChange={(e) => setFormData({...formData, scope: e.target.value})}
              placeholder="Ex: Unité de production A, Service maintenance"
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Lieu de l'audit"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            placeholder="Décrire l'objectif et le périmètre de l'audit..."
          />
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Planning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="plannedDate">Date planifiée *</Label>
            <Input
              id="plannedDate"
              type="date"
              value={formData.plannedDate}
              onChange={(e) => setFormData({...formData, plannedDate: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Durée (heures) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              required
            />
          </div>
        </div>
      </Card>

      {/* Standards */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Standards audités</h3>
        <div className="space-y-3">
          {formData.standards.map((standard, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1">{standard}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeStandard(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newStandard}
              onChange={(e) => setNewStandard(e.target.value)}
              placeholder="Ajouter un standard (ex: ISO 45001, OSHA, API)"
            />
            <Button type="button" variant="outline" onClick={addStandard}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Notes supplémentaires</h3>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
          placeholder="Ajouter des notes ou instructions spéciales..."
        />
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Programmer l'audit
        </Button>
      </div>
    </form>
  );
}