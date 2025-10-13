import React, { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/upload/FileUpload'
import { useEmployees } from '@/hooks/useEmployees'
import { usePackages } from '@/hooks/usePackages'
import { Priority } from '@/types'
import { toast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'

export function CreateMailDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { employees } = useEmployees()
  const { createMail } = usePackages()

  const [reference, setReference] = useState('')
  const [sender, setSender] = useState('')
  const [recipientMode, setRecipientMode] = useState<'employee' | 'service'>('employee')
  const [recipientEmployeeId, setRecipientEmployeeId] = useState('')
  const [recipientService, setRecipientService] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [isConfidential, setIsConfidential] = useState(true)
  const [scannedUrls, setScannedUrls] = useState<string[]>([])

  const services = useMemo(
    () => Array.from(new Set(employees.map(e => e.service))).sort(),
    [employees],
  )

  const onUpload = async (files: File[]): Promise<string[]> => {
    // Convertir en Data URL pour persistance locale
    const readAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    const urls = await Promise.all(files.map(readAsDataUrl))
    setScannedUrls(prev => [...prev, ...urls])
    return urls
  }

  const onSubmit = async () => {
    if (!reference || !sender) {
      toast({
        title: 'Champs requis',
        description: 'Référence et Expéditeur sont obligatoires.',
        variant: 'destructive',
      })
      return
    }
    if (recipientMode === 'employee' && !recipientEmployeeId) {
      toast({
        title: 'Destinataire requis',
        description: 'Sélectionnez un employé destinataire.',
        variant: 'destructive',
      })
      return
    }
    if (recipientMode === 'service' && !recipientService) {
      toast({
        title: 'Destinataire requis',
        description: 'Sélectionnez un service destinataire.',
        variant: 'destructive',
      })
      return
    }
    if (!isConfidential && scannedUrls.length === 0) {
      toast({
        title: 'Scan requis',
        description: 'Ajoutez au moins un scan pour un courrier non confidentiel.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await createMail({
        reference,
        sender,
        recipientEmployeeId: recipientMode === 'employee' ? recipientEmployeeId : undefined,
        recipientService: recipientMode === 'service' ? recipientService : undefined,
        description,
        priority,
        isConfidential,
        scannedFileUrls: isConfidential ? [] : scannedUrls,
      })
      setIsOpen(false)
      setReference('')
      setSender('')
      setRecipientEmployeeId('')
      setRecipientService('')
      setDescription('')
      setPriority('normal')
      setIsConfidential(true)
      setScannedUrls([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Mail className="w-4 h-4" />
            Nouveau courrier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau courrier</DialogTitle>
          <DialogDescription>
            Enregistrer un courrier confidentiel ou non confidentiel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Référence</Label>
              <Input
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="REF-..."
              />
            </div>
            <div>
              <Label>Expéditeur</Label>
              <Input
                value={sender}
                onChange={e => setSender(e.target.value)}
                placeholder="Nom de l'expéditeur"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Destinataire</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={recipientMode === 'employee' ? 'default' : 'outline'}
                  onClick={() => setRecipientMode('employee')}
                >
                  Employé
                </Button>
                <Button
                  variant={recipientMode === 'service' ? 'default' : 'outline'}
                  onClick={() => setRecipientMode('service')}
                >
                  Service
                </Button>
              </div>
              {recipientMode === 'employee' ? (
                <Select value={recipientEmployeeId} onValueChange={setRecipientEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} — {e.service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={recipientService} onValueChange={setRecipientService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Objet / notes..."
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <Checkbox
                checked={isConfidential}
                onCheckedChange={v => setIsConfidential(Boolean(v))}
                id="confidential"
              />
              <Label htmlFor="confidential">Courrier confidentiel (pas de numérisation)</Label>
            </div>
          </div>

          {!isConfidential && (
            <div className="space-y-2">
              <Label>Scans du courrier</Label>
              <FileUpload accept="image/*,.pdf" multiple maxFiles={10} onUpload={onUpload} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
