import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VisitForm } from '@/components/forms/VisitForm'
import { useVisits } from '@/hooks/useVisits'
import { useEmployees } from '@/hooks/useEmployees'
import { Visit, Visitor } from '@/types'
import { Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CreateVisitDialogProps {
  trigger?: React.ReactNode
  preselectedVisitor?: Visitor
  onSuccess?: (visit: Visit) => void
}

export function CreateVisitDialog({
  trigger,
  preselectedVisitor,
  onSuccess,
}: CreateVisitDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { createVisit, createVisitor, visitors } = useVisits()
  const { employees } = useEmployees()

  const handleSubmit = async (data: {
    visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>
    visitorData?: Omit<Visitor, 'id' | 'createdAt'>
  }) => {
    setIsLoading(true)

    try {
      let visitorId = preselectedVisitor?.id

      // Créer le visiteur si nécessaire
      if (data.visitorData) {
        const newVisitor = await createVisitor(data.visitorData)
        visitorId = newVisitor.id
      }

      if (!visitorId) {
        throw new Error('Visiteur non défini')
      }

      // Créer la visite
      const newVisit = await createVisit({
        ...data.visitData,
        visitorId,
      })

      setIsOpen(false)
      onSuccess?.(newVisit)

      toast({
        title: 'Visite programmée',
        description: 'La visite a été enregistrée avec succès',
      })
    } catch (error) {
      console.error('Erreur création visite:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de programmer la visite',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Calendar className="w-4 h-4" />
            Nouvelle visite
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programmer une nouvelle visite</DialogTitle>
          <DialogDescription>
            Planifiez une visite en remplissant les informations du visiteur et les détails de la
            visite.
          </DialogDescription>
        </DialogHeader>

        <VisitForm
          visitor={preselectedVisitor}
          employees={employees}
          visitors={visitors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
