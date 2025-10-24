import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X, Calendar, Clock, MapPin, User } from 'lucide-react';

interface TrainingFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function TrainingForm({ onSubmit, onCancel }: TrainingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'safety',
    category: '',
    duration: '',
    startDate: '',
    endDate: '',
    location: '',
    instructor: '',
    externalProvider: '',
    cost: '',
    required: true,
    renewalRequired: false,
    renewalPeriod: '',
    passingScore: 70,
    materials: [] as string[],
    sessions: [] as any[]
  });

  const [newMaterial, setNewMaterial] = useState('');
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    location: '',
    maxParticipants: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial.trim()]
      });
      setNewMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    });
  };

  const addSession = () => {
    if (newSession.date && newSession.time && newSession.location) {
      setFormData({
        ...formData,
        sessions: [...formData.sessions, {
          ...newSession,
          maxParticipants: parseInt(newSession.maxParticipants) || 20,
          enrolled: []
        }]
      });
      setNewSession({
        date: '',
        time: '',
        location: '',
        maxParticipants: ''
      });
    }
  };

  const removeSession = (index: number) => {
    setFormData({
      ...formData,
      sessions: formData.sessions.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Titre de la formation *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type de formation</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Sécurité</SelectItem>
                <SelectItem value="health">Santé</SelectItem>
                <SelectItem value="environment">Environnement</SelectItem>
                <SelectItem value="security">Sécurité</SelectItem>
                <SelectItem value="compliance">Conformité</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
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
        <div className="mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Planning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Date de début *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>
      </Card>

      {/* Sessions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Sessions de formation</h3>
        <div className="space-y-4">
          {formData.sessions.map((session, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">Session {index + 1}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(session.date).toLocaleDateString('fr-FR')} - {session.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.location} (Max: {session.maxParticipants} participants)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSession(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium mb-3">Ajouter une session</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionDate">Date</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sessionTime">Heure</Label>
                <Input
                  id="sessionTime"
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sessionLocation">Lieu</Label>
                <Input
                  id="sessionLocation"
                  value={newSession.location}
                  onChange={(e) => setNewSession({...newSession, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">Participants max</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession({...newSession, maxParticipants: e.target.value})}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addSession}
              className="mt-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la session
            </Button>
          </div>
        </div>
      </Card>

      {/* Location and Instructor */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Lieu et formateur</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="instructor">Formateur</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({...formData, instructor: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="externalProvider">Organisme externe</Label>
            <Input
              id="externalProvider"
              value={formData.externalProvider}
              onChange={(e) => setFormData({...formData, externalProvider: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="cost">Coût (FCFA)</Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
            />
          </div>
        </div>
      </Card>

      {/* Materials */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Matériels de formation</h3>
        <div className="space-y-3">
          {formData.materials.map((material, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1">{material}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeMaterial(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Ajouter un matériel"
            />
            <Button type="button" variant="outline" onClick={addMaterial}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Créer la formation
        </Button>
      </div>
    </form>
  );
}