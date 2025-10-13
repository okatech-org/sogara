import { useState } from 'react'
import { Mail as MailIcon, Sparkles, CheckCircle, Loader2, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { AIDocumentScanner } from './AIDocumentScanner'
import { mailService, Mail } from '@/services/mail-management.service'
import { ExtractionResult } from '@/services/ai-extraction.service'
import { toast } from '@/hooks/use-toast'

interface RegisterMailWithAIProps {
  onSuccess: (mail: Mail) => void
  onCancel: () => void
  open: boolean
}

export function RegisterMailWithAI({ onSuccess, onCancel, open }: RegisterMailWithAIProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scannedDocument, setScannedDocument] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    senderName: '',
    senderOrganization: '',
    recipientName: '',
    recipientDepartment: '',
    recipientEmail: '',
    type: 'lettre' as Mail['type'],
    confidentiality: 'normal' as Mail['confidentiality'],
    urgency: 'normal' as Mail['urgency'],
    distributionMethod: 'email' as Mail['distributionMethod'],
    requiresResponse: false,
    responseDeadline: '',
    notes: '',
    receivedBy: 'Reception',
  })

  const handleExtractionComplete = (result: ExtractionResult) => {
    setShowScanner(false)

    if (result.success) {
      setExtractedData(result.data)
      setFormData(prev => ({
        ...prev,
        senderName: result.data.sender?.name || prev.senderName,
        senderOrganization: result.data.sender?.organization || prev.senderOrganization,
        recipientName: result.data.recipient?.name || prev.recipientName,
        recipientDepartment: result.data.recipient?.department || prev.recipientDepartment,
        urgency: result.data.urgency || prev.urgency,
        confidentiality: result.data.confidentiality || prev.confidentiality,
      }))

      toast({
        title: 'Document scanné',
        description: `Type: ${result.data.documentType}`,
      })
    } else {
      toast({
        title: 'Échec du scan',
        description: 'Veuillez saisir les informations manuellement',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.senderName || !formData.recipientName || !formData.recipientDepartment) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const mail: Mail = {
        id: '',
        referenceNumber: '',
        senderName: formData.senderName,
        senderOrganization: formData.senderOrganization,
        recipientName: formData.recipientName,
        recipientDepartment: formData.recipientDepartment,
        recipientEmail: formData.recipientEmail || undefined,
        type: formData.type,
        confidentiality: formData.confidentiality,
        urgency: formData.urgency,
        scanned: !!scannedDocument,
        scanQuality: scannedDocument ? 'haute' : undefined,
        ocrProcessed: !!extractedData,
        ocrContent: extractedData?.fullText,
        documentUrl: scannedDocument || undefined,
        status: 'recu',
        distributionMethod: formData.distributionMethod,
        requiresResponse: formData.requiresResponse,
        responseDeadline: formData.responseDeadline || undefined,
        autoClassified: !!extractedData,
        suggestedCategory: extractedData?.suggestedCategory,
        keywords: extractedData?.keywords,
        summary: extractedData?.summary,
        archiveRequired: formData.type === 'contrat' || formData.type === 'facture',
        retentionPeriod: formData.type === 'contrat' ? '10 ans' : '5 ans',
        aiExtracted: !!extractedData,
        aiConfidence: extractedData ? 0.92 : undefined,
        receivedDate: new Date().toISOString(),
        receivedBy: formData.receivedBy,
        notes: formData.notes,
      }

      onSuccess(mail)

      toast({
        title: 'Courrier enregistré',
        description: `Courrier ${mail.type} enregistré avec succès`,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer le courrier",
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open && !showScanner} onOpenChange={onCancel}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailIcon className="w-5 h-5" />
              Enregistrer un Courrier
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Numérisation IA & OCR</h4>
                      <p className="text-sm text-blue-700">
                        Extraction automatique + Résumé + Classification
                      </p>
                      {extractedData?.keywords && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {extractedData.keywords.map((keyword: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Scanner courrier
                  </Button>
                </div>

                {extractedData?.summary && (
                  <Alert className="mt-4 border-blue-500 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Résumé:</strong> {extractedData.summary}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expéditeur *</Label>
                <Input
                  value={formData.senderName}
                  onChange={e => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Organisation expéditeur</Label>
                <Input
                  value={formData.senderOrganization}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, senderOrganization: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Destinataire *</Label>
                <Input
                  value={formData.recipientName}
                  onChange={e => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Service/Département *</Label>
                <Input
                  value={formData.recipientDepartment}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, recipientDepartment: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email destinataire</Label>
                <Input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={e => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="Pour envoi numérique"
                />
              </div>

              <div className="space-y-2">
                <Label>Type de courrier</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lettre">Lettre</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="facture">Facture</SelectItem>
                    <SelectItem value="contrat">Contrat</SelectItem>
                    <SelectItem value="administratif">Administratif</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Confidentialité</Label>
                <Select
                  value={formData.confidentiality}
                  onValueChange={(value: any) =>
                    setFormData(prev => ({ ...prev, confidentiality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="confidentiel">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        Confidentiel
                      </div>
                    </SelectItem>
                    <SelectItem value="tres_confidentiel">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        Très Confidentiel
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Urgence</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="tres_urgent">Très Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Méthode de distribution</Label>
                <Select
                  value={formData.distributionMethod}
                  onValueChange={(value: any) =>
                    setFormData(prev => ({ ...prev, distributionMethod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email uniquement (scan envoyé)</SelectItem>
                    <SelectItem value="physique">Physique uniquement</SelectItem>
                    <SelectItem value="les_deux">Les deux (scan + original)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresResponse">Réponse requise</Label>
                  <Switch
                    id="requiresResponse"
                    checked={formData.requiresResponse}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, requiresResponse: checked }))
                    }
                  />
                </div>

                {formData.requiresResponse && (
                  <div className="space-y-2">
                    <Label>Date limite de réponse</Label>
                    <Input
                      type="date"
                      value={formData.responseDeadline}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, responseDeadline: e.target.value }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Observations, instructions..."
                />
              </div>
            </div>

            {formData.confidentiality !== 'normal' && (
              <Alert className="border-red-500 bg-red-50">
                <Lock className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Courrier confidentiel :</strong> L'accès sera restreint et aucun scan ne
                  sera envoyé par email
                </AlertDescription>
              </Alert>
            )}

            {extractedData && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Données extraites par IA
                    </h4>

                    {extractedData.summary && (
                      <div className="text-sm">
                        <span className="font-medium">Résumé : </span>
                        <span className="text-muted-foreground">{extractedData.summary}</span>
                      </div>
                    )}

                    {extractedData.keywords && extractedData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm font-medium mr-2">Mots-clés:</span>
                        {extractedData.keywords.map((keyword: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {extractedData.suggestedCategory && (
                      <div className="text-sm">
                        <span className="font-medium">Catégorie suggérée : </span>
                        <Badge variant="outline">{extractedData.suggestedCategory}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                    Enregistrer courrier
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <AIDocumentScanner
          title="Scanner le courrier"
          documentType="mail"
          onExtracted={handleExtractionComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </>
  )
}
