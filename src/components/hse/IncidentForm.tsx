import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileUpload } from '@/components/upload/FileUpload';

import { HSEIncident, Employee } from '@/types';
import { AlertTriangle, Save, X, CalendarIcon, MapPin, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Schéma de validation
const incidentFormSchema = z.object({
  employeeId: z.string().min(1, 'Employé impliqué requis'),
  type: z.string().min(5, 'Type d\'incident requis'),
  severity: z.enum(['low', 'medium', 'high'], {
    required_error: 'Niveau de gravité requis'
  }),
  description: z.string()
    .min(10, 'Description détaillée requise (minimum 10 caractères)')
    .max(2000, 'Description trop longue (maximum 2000 caractères)'),
  location: z.string()
    .min(5, 'Localisation requise')
    .max(200, 'Localisation trop longue'),
  occurredAt: z.date({
    required_error: 'Date et heure de l\'incident requises'
  }),
  reportedBy: z.string().min(1, 'Rapporteur requis')
});

type IncidentFormData = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  incident?: HSEIncident;
  employees: Employee[];
  currentUserId: string;
  onSubmit: (data: IncidentFormData & { attachments?: string[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Types d'incidents prédéfinis
const INCIDENT_TYPES = [
  'Accident du travail',
  'Presque accident',
  'Condition dangereuse',
  'Non-conformité sécurité',
  'Déversement',
  'Incendie',
  'Blessure',
  'Défaillance équipement',
  'Non-respect procédure',
  'Autre'
];

// Niveaux de gravité avec descriptions
const SEVERITY_LEVELS = [
  {
    value: 'low' as const,
    label: 'Faible',
    description: 'Incident mineur sans blessure',
    color: 'bg-green-500 text-white'
  },
  {
    value: 'medium' as const,
    label: 'Moyen',
    description: 'Incident avec blessure légère ou dégât matériel',
    color: 'bg-yellow-500 text-white'
  },
  {
    value: 'high' as const,
    label: 'Élevé',
    description: 'Incident grave avec blessure ou risque majeur',
    color: 'bg-red-500 text-white'
  }
];

export function IncidentForm({ 
  incident, 
  employees, 
  currentUserId, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: IncidentFormProps) {
  const [attachments, setAttachments] = useState<string[]>(incident?.attachments || []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      employeeId: incident?.employeeId || '',
      type: incident?.type || '',
      severity: incident?.severity || 'medium',
      description: incident?.description || '',
      location: incident?.location || '',
      occurredAt: incident?.occurredAt || new Date(),
      reportedBy: incident?.reportedBy || currentUserId
    }
  });

  const watchedSeverity = watch('severity');
  const watchedDate = watch('occurredAt');

  // Soumission du formulaire
  const onFormSubmit = async (data: IncidentFormData) => {
    try {
      await onSubmit({
        ...data,
        attachments
      });
    } catch (error) {
      console.error('Erreur soumission incident:', error);
    }
  };

  // Gérer l'upload de pièces jointes
  const handleAttachmentsUpload = async (files: File[]): Promise<string[]> => {
    // Simuler l'upload (en production, utiliser l'API)
    const urls = files.map(file => URL.createObjectURL(file));
    setAttachments(prev => [...prev, ...urls]);
    
    toast({
      title: 'Pièces jointes ajoutées',
      description: `${files.length} fichier(s) ajouté(s)`
    });
    
    return urls;
  };

  // Supprimer une pièce jointe
  const removeAttachment = (url: string) => {
    setAttachments(prev => prev.filter(attachment => attachment !== url));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          {incident ? 'Modifier l\'incident' : 'Signaler un incident HSE'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employé impliqué *</Label>
                <Controller
                  control={control}
                  name="employeeId"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Sélectionnez un employé</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} ({employee.matricule})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.employeeId && (
                  <p className="text-sm text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type d'incident *</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Sélectionnez un type</option>
                      {INCIDENT_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Zone, bâtiment, équipement..."
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date et heure *</Label>
                <Controller
                  control={control}
                  name="occurredAt"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP 'à' HH:mm")
                          ) : (
                            "Sélectionner une date"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              const currentTime = field.value || new Date();
                              date.setHours(currentTime.getHours(), currentTime.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Label htmlFor="time">Heure</Label>
                          <Input
                            id="time"
                            type="time"
                            value={field.value ? format(field.value, 'HH:mm') : ''}
                            onChange={(e) => {
                              if (field.value && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(newDate);
                              }
                            }}
                            className="mt-1"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.occurredAt && (
                  <p className="text-sm text-destructive">{errors.occurredAt.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Gravité */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Niveau de gravité</h3>
            
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SEVERITY_LEVELS.map((level) => (
                    <div
                      key={level.value}
                      className={cn(
                        'p-4 rounded-lg border cursor-pointer transition-all',
                        field.value === level.value
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:bg-muted/30'
                      )}
                      onClick={() => field.onChange(level.value)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={field.value === level.value}
                          onChange={() => field.onChange(level.value)}
                          className="sr-only"
                        />
                        <Badge className={level.color}>
                          {level.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {level.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.severity && (
              <p className="text-sm text-destructive">{errors.severity.message}</p>
            )}
          </div>

          {/* Description détaillée */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Description de l'incident</h3>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Décrivez l'incident en détail : que s'est-il passé, comment, pourquoi..."
                rows={6}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Plus la description est détaillée, plus l'analyse sera précise.
              </p>
            </div>
          </div>

          {/* Pièces jointes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pièces jointes</h3>
            
            <FileUpload
              accept="image/*,.pdf,.doc,.docx"
              multiple={true}
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
              onUpload={handleAttachmentsUpload}
              title="Photos, documents, rapports"
              description="Ajoutez des photos de l'incident, rapports médicaux, etc."
              showPreview={true}
            />
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Fichiers ajoutés :</p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((url, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeAttachment(url)}
                    >
                      Fichier {index + 1}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Résumé */}
          {watchedDate && (
            <Card className={cn(
              'border-2',
              watchedSeverity === 'high' ? 'border-red-200 bg-red-50' :
              watchedSeverity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn(
                    'w-5 h-5 mt-0.5',
                    watchedSeverity === 'high' ? 'text-red-600' :
                    watchedSeverity === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  )} />
                  
                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium">Résumé de l'incident</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        <strong>Lieu:</strong> {watch('location')}
                      </p>
                      <p>
                        <CalendarIcon className="w-3 h-3 inline mr-1" />
                        <strong>Date:</strong> {format(watchedDate, "dd/MM/yyyy 'à' HH:mm")}
                      </p>
                      <p>
                        <User className="w-3 h-3 inline mr-1" />
                        <strong>Employé:</strong> {employees.find(e => e.id === watch('employeeId'))?.firstName} {employees.find(e => e.id === watch('employeeId'))?.lastName}
                      </p>
                      <p>
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        <strong>Gravité:</strong> {SEVERITY_LEVELS.find(s => s.value === watchedSeverity)?.label}
                      </p>
                    </div>
                    
                    {watch('type') && (
                      <p>
                        <strong>Type:</strong> {watch('type')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations importantes */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                ℹ️ Informations importantes
              </h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• En cas d'incident grave, prévenez immédiatement le responsable HSE</li>
                <li>• Conservez les preuves physiques et prenez des photos si possible</li>
                <li>• Ne déplacez pas la victime en cas de blessure grave</li>
                <li>• Signalez tout témoin de l'incident</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="gap-2"
              variant={watchedSeverity === 'high' ? 'destructive' : 'default'}
            >
              <Save className="w-4 h-4" />
              {incident ? 'Mettre à jour' : 'Signaler l\'incident'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
