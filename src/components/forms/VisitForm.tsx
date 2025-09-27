import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Visit, Visitor, Employee } from '@/types';
import { CalendarIcon, User, Save, X, Search, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Schéma de validation
const visitFormSchema = z.object({
  visitor: z.object({
    id: z.string().optional(),
    firstName: z.string().min(2, 'Prénom requis'),
    lastName: z.string().min(2, 'Nom requis'),
    company: z.string().min(2, 'Société requise'),
    idDocument: z.string().min(5, 'Document d\'identité requis'),
    documentType: z.enum(['cin', 'passport', 'other']),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }),
  
  hostEmployeeId: z.string().min(1, 'Hôte requis'),
  
  scheduledAt: z.date({
    required_error: 'Date et heure requises'
  }),
  
  purpose: z.string()
    .min(5, 'L\'objet de la visite doit contenir au moins 5 caractères')
    .max(500, 'L\'objet ne peut pas dépasser 500 caractères'),
  
  notes: z.string().max(1000).optional(),
  
  badgeNumber: z.string().max(20).optional()
});

type VisitFormData = z.infer<typeof visitFormSchema>;

interface VisitFormProps {
  visit?: Visit;
  visitor?: Visitor;
  employees: Employee[];
  onSubmit: (data: {
    visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>;
    visitorData?: Omit<Visitor, 'id' | 'createdAt'>;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VisitForm({ 
  visit, 
  visitor, 
  employees, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: VisitFormProps) {
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(visitor || null);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [showVisitorSearch, setShowVisitorSearch] = useState(!visitor && !visit);
  const [isCreatingNewVisitor, setIsCreatingNewVisitor] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitor: {
        firstName: visitor?.firstName || '',
        lastName: visitor?.lastName || '',
        company: visitor?.company || '',
        idDocument: visitor?.idDocument || '',
        documentType: visitor?.documentType || 'cin',
        phone: visitor?.phone || '',
        email: visitor?.email || ''
      },
      hostEmployeeId: visit?.hostEmployeeId || '',
      scheduledAt: visit?.scheduledAt || addDays(new Date(), 1),
      purpose: visit?.purpose || '',
      notes: visit?.notes || '',
      badgeNumber: visit?.badgeNumber || ''
    }
  });

  const watchedDate = watch('scheduledAt');

  // Filtrer les employés qui peuvent être des hôtes
  const availableHosts = employees.filter(emp => 
    emp.roles.some(role => ['ADMIN', 'HSE', 'SUPERVISEUR', 'RECEP'].includes(role)) &&
    emp.status === 'active'
  );

  // Soumission du formulaire
  const onFormSubmit = async (data: VisitFormData) => {
    try {
      const visitData = {
        visitorId: selectedVisitor?.id || '', // Sera défini après création du visiteur
        hostEmployeeId: data.hostEmployeeId,
        scheduledAt: data.scheduledAt,
        status: 'expected' as const,
        purpose: data.purpose,
        notes: data.notes,
        badgeNumber: data.badgeNumber
      };

      let visitorData = undefined;
      
      // Si pas de visiteur sélectionné, créer un nouveau visiteur
      if (!selectedVisitor) {
        visitorData = {
          firstName: data.visitor.firstName,
          lastName: data.visitor.lastName,
          company: data.visitor.company,
          idDocument: data.visitor.idDocument,
          documentType: data.visitor.documentType,
          phone: data.visitor.phone,
          email: data.visitor.email
        };
      }

      await onSubmit({ visitData, visitorData });
      
    } catch (error) {
      console.error('Erreur soumission visite:', error);
    }
  };

  // Sélectionner un visiteur existant
  const selectExistingVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setValue('visitor.firstName', visitor.firstName);
    setValue('visitor.lastName', visitor.lastName);
    setValue('visitor.company', visitor.company);
    setValue('visitor.idDocument', visitor.idDocument);
    setValue('visitor.documentType', visitor.documentType);
    setValue('visitor.phone', visitor.phone || '');
    setValue('visitor.email', visitor.email || '');
    setShowVisitorSearch(false);
  };

  // Créer un nouveau visiteur
  const createNewVisitor = () => {
    setSelectedVisitor(null);
    setIsCreatingNewVisitor(true);
    setShowVisitorSearch(false);
    
    // Reset les champs visiteur
    setValue('visitor.firstName', '');
    setValue('visitor.lastName', '');
    setValue('visitor.company', '');
    setValue('visitor.idDocument', '');
    setValue('visitor.documentType', 'cin');
    setValue('visitor.phone', '');
    setValue('visitor.email', '');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {visit ? 'Modifier la visite' : 'Nouvelle visite'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Sélection/Création visiteur */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Visiteur</h3>
              
              {!visit && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVisitorSearch(true)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={createNewVisitor}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau
                  </Button>
                </div>
              )}
            </div>

            {selectedVisitor && !isCreatingNewVisitor && (
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {selectedVisitor.firstName} {selectedVisitor.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedVisitor.company} • {selectedVisitor.idDocument}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedVisitor(null);
                      setIsCreatingNewVisitor(true);
                    }}
                  >
                    Modifier
                  </Button>
                </div>
              </Card>
            )}

            {(isCreatingNewVisitor || !selectedVisitor) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitor.firstName">Prénom *</Label>
                  <Input
                    id="visitor.firstName"
                    {...register('visitor.firstName')}
                    placeholder="Prénom du visiteur"
                  />
                  {errors.visitor?.firstName && (
                    <p className="text-sm text-destructive">{errors.visitor.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor.lastName">Nom *</Label>
                  <Input
                    id="visitor.lastName"
                    {...register('visitor.lastName')}
                    placeholder="Nom du visiteur"
                  />
                  {errors.visitor?.lastName && (
                    <p className="text-sm text-destructive">{errors.visitor.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor.company">Société *</Label>
                  <Input
                    id="visitor.company"
                    {...register('visitor.company')}
                    placeholder="Nom de la société"
                  />
                  {errors.visitor?.company && (
                    <p className="text-sm text-destructive">{errors.visitor.company.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor.idDocument">Document d'identité *</Label>
                  <Input
                    id="visitor.idDocument"
                    {...register('visitor.idDocument')}
                    placeholder="Numéro de document"
                  />
                  {errors.visitor?.idDocument && (
                    <p className="text-sm text-destructive">{errors.visitor.idDocument.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor.documentType">Type de document</Label>
                  <Controller
                    control={control}
                    name="visitor.documentType"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="cin">Carte d'identité</option>
                        <option value="passport">Passeport</option>
                        <option value="other">Autre</option>
                      </select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor.phone">Téléphone</Label>
                  <Input
                    id="visitor.phone"
                    {...register('visitor.phone')}
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor.email">Email</Label>
                  <Input
                    id="visitor.email"
                    type="email"
                    {...register('visitor.email')}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Détails de la visite */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Détails de la visite</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostEmployeeId">Hôte *</Label>
                <Controller
                  control={control}
                  name="hostEmployeeId"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Sélectionnez un hôte</option>
                      {availableHosts.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} ({employee.service})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.hostEmployeeId && (
                  <p className="text-sm text-destructive">{errors.hostEmployeeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date et heure *</Label>
                <Controller
                  control={control}
                  name="scheduledAt"
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
                            format(field.value, "PPP à HH:mm", { locale: fr })
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
                              // Garder l'heure si elle existe, sinon définir à 9h00
                              const currentTime = field.value || new Date();
                              date.setHours(currentTime.getHours(), currentTime.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Label htmlFor="time">Heure</Label>
                          <Input
                            id="time"
                            type="time"
                            value={field.value ? format(field.value, 'HH:mm') : '09:00'}
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
                {errors.scheduledAt && (
                  <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Objet de la visite *</Label>
              <Textarea
                id="purpose"
                {...register('purpose')}
                placeholder="Décrivez l'objet de la visite..."
                rows={3}
              />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badgeNumber">Numéro de badge</Label>
                <Input
                  id="badgeNumber"
                  {...register('badgeNumber')}
                  placeholder="Ex: B001"
                />
                {errors.badgeNumber && (
                  <p className="text-sm text-destructive">{errors.badgeNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Notes additionnelles..."
                  rows={2}
                />
                {errors.notes && (
                  <p className="text-sm text-destructive">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Résumé */}
          {watchedDate && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Résumé de la visite</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Visiteur:</strong> {watch('visitor.firstName')} {watch('visitor.lastName')}
                    {watch('visitor.company') && ` (${watch('visitor.company')})`}
                  </p>
                  <p>
                    <strong>Hôte:</strong> {availableHosts.find(emp => emp.id === watch('hostEmployeeId'))?.firstName} {availableHosts.find(emp => emp.id === watch('hostEmployeeId'))?.lastName}
                  </p>
                  <p>
                    <strong>Date:</strong> {format(watchedDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                  <p>
                    <strong>Objet:</strong> {watch('purpose')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
            >
              <Save className="w-4 h-4" />
              {visit ? 'Mettre à jour' : 'Programmer la visite'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
