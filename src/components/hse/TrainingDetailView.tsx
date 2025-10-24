import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Award,
  FileText,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import type { HSETraining } from '@/types';

interface TrainingDetailViewProps {
  training: HSETraining;
  onClose: () => void;
  coordinator: string;
  onUpdate?: (training: HSETraining) => void;
}

export default function TrainingDetailView({ training, onClose, coordinator, onUpdate }: TrainingDetailViewProps) {
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'expired': 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'safety': '🛡️ Sécurité',
      'health': '🏥 Santé',
      'environment': '🌱 Environnement',
      'security': '🔒 Sécurité',
      'compliance': '📋 Conformité',
      'other': '📚 Autre',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const handleEnrollParticipant = async () => {
    try {
      const response = await fetch(`/api/hse/trainings/${training.id}/enroll/${newParticipant}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const updatedTraining = await response.json();
        onUpdate?.(updatedTraining.data);
        setShowEnrollmentDialog(false);
        setNewParticipant('');
      }
    } catch (error) {
      console.error('Error enrolling participant:', error);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const response = await fetch(`/api/hse/trainings/${training.id}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Handle certificate generation result
        console.log('Certificate generated:', result);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{training.title}</h2>
          <div className="flex gap-2 mb-4">
            <Badge className={getStatusColor(training.status)}>
              {training.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {getCategoryLabel(training.category)}
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {training.duration}h
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Training Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Informations générales
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Date de début:</strong> {new Date(training.startDate).toLocaleDateString('fr-FR')}</span>
            </div>
            {training.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Date de fin:</strong> {new Date(training.endDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {training.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Lieu:</strong> {training.location}</span>
              </div>
            )}
            {training.instructor && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Formateur:</strong> {training.instructor}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants et certification
          </h3>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Participants inscrits:</strong> {training.schedule?.sessions?.[0]?.enrolled?.length || 0}
            </div>
            {training.certificateNumber && (
              <div className="text-sm">
                <strong>Numéro de certificat:</strong> {training.certificateNumber}
              </div>
            )}
            {training.certificateExpiry && (
              <div className="text-sm">
                <strong>Expiration:</strong> {new Date(training.certificateExpiry).toLocaleDateString('fr-FR')}
              </div>
            )}
            {training.score && (
              <div className="text-sm">
                <strong>Score obtenu:</strong> {training.score}/100
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Description */}
      {training.description && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Description de la formation</h3>
          <p className="text-gray-700">{training.description}</p>
        </Card>
      )}

      {/* Training Schedule */}
      {training.schedule?.sessions && training.schedule.sessions.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Planning des sessions</h3>
            <Button 
              size="sm" 
              onClick={() => setShowEnrollmentDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Inscrire un participant
            </Button>
          </div>
          <div className="space-y-3">
            {training.schedule.sessions.map((session, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Session {idx + 1}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString('fr-FR')} - {session.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Lieu: {session.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Participants: {session.enrolled?.length || 0}/{session.maxParticipants}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {session.enrolled?.length || 0} inscrits
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Materials and Resources */}
      {training.materials && training.materials.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Matériels de formation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {training.materials.map((material, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{material}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {training.status === 'completed' && !training.certificateNumber && (
          <Button onClick={handleGenerateCertificate}>
            <Award className="h-4 w-4 mr-2" />
            Générer certificat
          </Button>
        )}
        {training.status === 'scheduled' && (
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Gérer les participants
          </Button>
        )}
      </div>

      {/* Enrollment Dialog */}
      {showEnrollmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="font-semibold mb-4">Inscrire un participant</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="participant">ID de l'employé</Label>
                <Input
                  id="participant"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  placeholder="Entrez l'ID de l'employé"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEnrollmentDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleEnrollParticipant}>
                Inscrire
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}