import { useState } from 'react';
import { Package, Sparkles, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIDocumentScanner } from './AIDocumentScanner';
import { packageService, PackageItem } from '@/services/package-management.service';
import { ExtractionResult } from '@/services/ai-extraction.service';
import { toast } from '@/hooks/use-toast';

interface RegisterPackageWithAIProps {
  onSuccess: (pkg: PackageItem) => void;
  onCancel: () => void;
  open: boolean;
}

export function RegisterPackageWithAI({ onSuccess, onCancel, open }: RegisterPackageWithAIProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    trackingNumber: '',
    senderName: '',
    senderOrganization: '',
    recipientName: '',
    recipientDepartment: '',
    category: 'standard' as PackageItem['category'],
    priority: 'normal' as PackageItem['priority'],
    weight: '',
    notes: '',
    receivedBy: 'Reception'
  });

  const handleExtractionComplete = (result: ExtractionResult) => {
    setShowScanner(false);
    
    if (result.success) {
      setExtractedData(result.data);
      setFormData(prev => ({
        ...prev,
        trackingNumber: result.data.trackingNumber || prev.trackingNumber,
        senderName: result.data.sender?.name || prev.senderName,
        senderOrganization: result.data.sender?.organization || prev.senderOrganization,
        recipientName: result.data.recipient?.name || prev.recipientName,
        recipientDepartment: result.data.recipient?.department || prev.recipientDepartment,
        notes: result.data.specialInstructions || prev.notes
      }));
      
      if (result.data.weight) {
        setFormData(prev => ({ ...prev, weight: result.data.weight }));
      }
      
      toast({
        title: 'Extraction réussie',
        description: `Numéro de suivi: ${result.data.trackingNumber}`,
      });
    } else {
      toast({
        title: 'Échec de l\'extraction',
        description: 'Veuillez saisir les informations manuellement',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.senderName || !formData.recipientName || !formData.recipientDepartment) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const pkg: PackageItem = {
        id: '',
        trackingNumber: formData.trackingNumber || `GA${Date.now()}`,
        senderName: formData.senderName,
        senderOrganization: formData.senderOrganization,
        recipientName: formData.recipientName,
        recipientDepartment: formData.recipientDepartment,
        category: formData.category,
        priority: formData.priority,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        status: 'reception',
        receivedDate: new Date().toISOString(),
        signatureRequired: formData.category === 'valuable' || formData.category === 'confidential',
        notificationSent: false,
        reminderCount: 0,
        receivedBy: formData.receivedBy,
        notes: formData.notes,
        aiScanned: !!extractedData,
        autoClassified: !!extractedData,
        photos: scannedImage ? [scannedImage] : undefined
      };
      
      onSuccess(pkg);
      
      toast({
        title: 'Colis enregistré',
        description: `Colis ${pkg.trackingNumber} enregistré avec succès`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le colis',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showScanner} onOpenChange={onCancel}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Enregistrer un Colis
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-purple-900">Scan IA de l'étiquette</h4>
                      <p className="text-sm text-purple-700">Extraction automatique des informations</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Scanner étiquette
                  </Button>
                </div>

                {extractedData && (
                  <Alert className="mt-4 border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      Étiquette scannée ! Numéro: {extractedData.trackingNumber}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numéro de suivi</Label>
                <Input
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="Auto-généré si vide"
                />
              </div>

              <div className="space-y-2">
                <Label>Poids (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Expéditeur *</Label>
                <Input
                  value={formData.senderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Organisation expéditeur</Label>
                <Input
                  value={formData.senderOrganization}
                  onChange={(e) => setFormData(prev => ({ ...prev, senderOrganization: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Destinataire *</Label>
                <Input
                  value={formData.recipientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Service/Département *</Label>
                <Input
                  value={formData.recipientDepartment}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientDepartment: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="valuable">Valeur déclarée</SelectItem>
                    <SelectItem value="confidential">Confidentiel</SelectItem>
                    <SelectItem value="medical">Médical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="immediate">Immédiat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Notes / Instructions</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Instructions spéciales, observations..."
                />
              </div>
            </div>

            {formData.priority === 'urgent' && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Colis urgent : Notification immédiate sera envoyée au destinataire
                </AlertDescription>
              </Alert>
            )}

            {formData.category === 'fragile' && (
              <Alert className="border-blue-500 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Colis fragile : Stockage en zone sécurisée automatique
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer colis
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <AIDocumentScanner
          title="Scanner l'étiquette du colis"
          documentType="package"
          onExtracted={handleExtractionComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

