import { useState, useRef } from 'react'
import {
  Camera,
  Upload,
  Scan,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ExtractionResult, aiExtractionService } from '@/services/ai-extraction.service'

interface AIDocumentScannerProps {
  title: string
  documentType: 'identity' | 'mail' | 'package'
  onExtracted: (result: ExtractionResult) => void
  onCancel: () => void
  acceptedFormats?: string[]
}

export function AIDocumentScanner({
  title,
  documentType,
  onExtracted,
  onCancel,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
}: AIDocumentScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!acceptedFormats.includes(file.type)) {
      alert('Format de fichier non supporté. Utilisez JPG, PNG, WebP ou PDF.')
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = e => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleExtraction = async () => {
    if (!selectedFile || !previewUrl) return

    setIsExtracting(true)
    setProgress(0)
    setCurrentStep("Préparation de l'image...")

    try {
      await simulateProgress(20, "Préparation de l'image...")

      setCurrentStep('Analyse par IA...')
      await simulateProgress(40, 'Analyse par IA...')

      // Utiliser le service IA réel au lieu des données mockées
      let result: ExtractionResult
      console.log(`🔧 Extraction du document type: ${documentType}`)

      if (documentType === 'identity') {
        console.log('📷 Appel extraction identité avec image...')
        result = await aiExtractionService.extractIdentityDocument(previewUrl)
      } else if (documentType === 'package') {
        console.log('📦 Appel extraction colis avec image...')
        result = await aiExtractionService.extractPackageLabel(previewUrl)
      } else if (documentType === 'mail') {
        console.log('✉️ Appel extraction courrier avec image...')
        result = await aiExtractionService.extractMailDocument(previewUrl)
      } else {
        throw new Error('Type de document non supporté')
      }

      console.log('📊 Résultat extraction:', result)

      setCurrentStep('Validation des données...')
      await simulateProgress(80, 'Validation des données...')

      await simulateProgress(100, 'Terminé !')

      setExtractionResult(result)

      setTimeout(() => {
        onExtracted(result)
      }, 500)
    } catch (error: any) {
      console.error('❌ Erreur extraction:', error)
      setExtractionResult({
        success: false,
        confidence: 0,
        data: {},
        warnings: [`Erreur lors de l'extraction: ${error.message || 'Erreur inconnue'}`],
        requiresVerification: true,
      })
    } finally {
      setTimeout(() => setIsExtracting(false), 500)
    }
  }

  const simulateProgress = (target: number, step: string): Promise<void> => {
    return new Promise(resolve => {
      setCurrentStep(step)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= target) {
            clearInterval(interval)
            resolve()
            return target
          }
          return prev + 2
        })
      }, 30)
    })
  }

  const generateMockData = (type: string) => {
    switch (type) {
      case 'identity':
        return {
          firstName: 'Jean',
          lastName: 'NGUEMA',
          idNumber: `CNI${Math.floor(Math.random() * 1000000000)}`,
          idType: 'CNI',
          nationality: 'Gabonaise',
          birthDate: '1990-05-15',
        }
      case 'package':
        return {
          trackingNumber: `GA${Date.now()}`,
          sender: { name: 'DHL Express', organization: 'DHL' },
          recipient: { name: 'Service IT', department: 'Informatique' },
          packageCategory: 'standard',
        }
      case 'mail':
        return {
          sender: { name: 'Direction Générale', organization: 'Ministère' },
          recipient: { name: 'SOGARA', department: 'Direction' },
          documentType: 'lettre',
          urgency: 'normal',
        }
      default:
        return {}
    }
  }

  const resetScanner = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setExtractionResult(null)
    setProgress(0)
    setCurrentStep('')
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Scannez ou téléchargez un document pour extraction automatique des données
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Zone de sélection/aperçu */}
          {!previewUrl ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Sélectionnez un document</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Formats supportés: JPG, PNG, WebP, PDF
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 gap-3 flex-col"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8" />
                      <span>Prendre une photo</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 gap-3 flex-col"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8" />
                      <span>Télécharger un fichier</span>
                    </Button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats.join(',')}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Aperçu du document</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetScanner} disabled={isExtracting}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border">
                  {selectedFile?.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted h-96">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H13L15,19H13L11.5,16L10,19M8,11V19H10V13H11C11.6,13 12,12.6 12,12V11C12,10.4 11.6,10 11,10H8M10,11H11V12H10V11Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-lg">Document PDF</p>
                          <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            La première page sera analysée par l'IA
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="w-full h-auto max-h-96 object-contain bg-muted"
                    />
                  )}
                  {isExtracting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-6 text-center space-y-4 max-w-sm">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                        <div className="space-y-2">
                          <p className="font-medium">{currentStep}</p>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{progress}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedFile && !isExtracting && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline">{selectedFile.name}</Badge>
                    <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                )}

                {extractionResult && (
                  <Alert
                    className={
                      extractionResult.success
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }
                  >
                    {extractionResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {extractionResult.success ? (
                        <div className="space-y-2">
                          <p className="font-medium text-green-800">Extraction réussie !</p>
                          <div className="text-xs text-green-700">
                            <p>Confiance: {Math.round(extractionResult.confidence * 100)}%</p>
                            <p>Champs extraits: {extractionResult.extractedFields?.length || 0}</p>
                            {extractionResult.processingTime && (
                              <p>Temps: {extractionResult.processingTime}ms</p>
                            )}
                          </div>
                          {extractionResult.warnings.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {extractionResult.warnings.map((warning, i) => (
                                <p key={i} className="text-xs text-orange-600">
                                  ⚠️ {warning}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-red-800">Échec de l'extraction</p>
                          {extractionResult.warnings.map((warning, i) => (
                            <p key={i} className="text-xs text-red-700 mt-1">
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={onCancel} disabled={isExtracting}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>

            {previewUrl && !extractionResult && (
              <Button onClick={handleExtraction} disabled={isExtracting} className="gap-2">
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extraction en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extraire avec IA
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
