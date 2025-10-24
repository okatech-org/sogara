import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function IncidentForm({ onSubmit, onCancel }: IncidentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    category: 'safety',
    location: '',
    type: '',
    incidentDate: new Date().toISOString().split('T')[0],
    witnesses: '',
    injuries: 0,
    fatalities: 0,
    environmentalImpact: false,
    propertyDamage: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est requis';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Le type est requis';
    }

    if (formData.injuries < 0) {
      newErrors.injuries = 'Le nombre de blessés ne peut pas être négatif';
    }

    if (formData.fatalities < 0) {
      newErrors.fatalities = 'Le nombre de décès ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        witnesses: formData.witnesses ? formData.witnesses.split(',').map(w => w.trim()) : [],
        propertyDamage: formData.propertyDamage ? parseFloat(formData.propertyDamage) : null,
        incidentDate: new Date(formData.incidentDate),
        occurredAt: new Date(formData.incidentDate)
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'incident *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Ex: Chute d'un employé dans l'unité de production"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description détaillée *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Décrivez l'incident en détail..."
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Severity and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="severity">Gravité *</Label>
          <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="critical">Critique</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <option value="safety">Sécurité</option>
            <option value="health">Santé</option>
            <option value="environment">Environnement</option>
            <option value="security">Sécurité</option>
            <option value="other">Autre</option>
          </Select>
        </div>
      </div>

      {/* Location and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Lieu *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Ex: Unité de production A, Zone de stockage"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type d'incident *</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            placeholder="Ex: Chute, Brûlure, Exposition chimique"
            className={errors.type ? 'border-red-500' : ''}
          />
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type}</p>
          )}
        </div>
      </div>

      {/* Incident Date */}
      <div className="space-y-2">
        <Label htmlFor="incidentDate">Date de l'incident *</Label>
        <Input
          id="incidentDate"
          type="date"
          value={formData.incidentDate}
          onChange={(e) => handleInputChange('incidentDate', e.target.value)}
        />
      </div>

      {/* Witnesses */}
      <div className="space-y-2">
        <Label htmlFor="witnesses">Témoins (séparés par des virgules)</Label>
        <Input
          id="witnesses"
          value={formData.witnesses}
          onChange={(e) => handleInputChange('witnesses', e.target.value)}
          placeholder="Ex: Jean Dupont, Marie Martin"
        />
      </div>

      {/* Injuries and Fatalities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="injuries">Nombre de blessés</Label>
          <Input
            id="injuries"
            type="number"
            min="0"
            value={formData.injuries}
            onChange={(e) => handleInputChange('injuries', parseInt(e.target.value) || 0)}
            className={errors.injuries ? 'border-red-500' : ''}
          />
          {errors.injuries && (
            <p className="text-sm text-red-500">{errors.injuries}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatalities">Nombre de décès</Label>
          <Input
            id="fatalities"
            type="number"
            min="0"
            value={formData.fatalities}
            onChange={(e) => handleInputChange('fatalities', parseInt(e.target.value) || 0)}
            className={errors.fatalities ? 'border-red-500' : ''}
          />
          {errors.fatalities && (
            <p className="text-sm text-red-500">{errors.fatalities}</p>
          )}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="environmentalImpact"
          checked={formData.environmentalImpact}
          onChange={(e) => handleInputChange('environmentalImpact', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="environmentalImpact">Impact environnemental</Label>
      </div>

      {/* Property Damage */}
      <div className="space-y-2">
        <Label htmlFor="propertyDamage">Coût des dégâts matériels (FCFA)</Label>
        <Input
          id="propertyDamage"
          type="number"
          min="0"
          step="0.01"
          value={formData.propertyDamage}
          onChange={(e) => handleInputChange('propertyDamage', e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Severity Warning */}
      {['high', 'critical'].includes(formData.severity) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Attention:</strong> Les incidents de gravité {formData.severity} seront automatiquement escaladés vers HSE001 pour approbation.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Créer l'Incident
        </Button>
      </div>
    </form>
  );
}