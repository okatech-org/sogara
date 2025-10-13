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
import { EmployeeForm } from '@/components/forms/EmployeeForm'
import { useEmployees } from '@/hooks/useEmployees'
import { Employee } from '@/types'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CreateEmployeeDialogProps {
  trigger?: React.ReactNode
  onSuccess?: (employee: Employee) => void
}

export function CreateEmployeeDialog({ trigger, onSuccess }: CreateEmployeeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { createEmployee } = useEmployees()

  const handleSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const newEmployee = await createEmployee({
        firstName: data.firstName,
        lastName: data.lastName,
        matricule: data.matricule,
        service: data.service,
        roles: data.roles,
        competences: data.competences || [],
        habilitations: data.habilitations || [],
        email: data.email || undefined,
        phone: data.phone || undefined,
        status: data.status,
      })

      setIsOpen(false)
      onSuccess?.(newEmployee)

      toast({
        title: 'Employé créé',
        description: `${data.firstName} ${data.lastName} a été ajouté avec succès`,
      })
    } catch (error) {
      console.error('Erreur création employé:', error)
      toast({
        title: 'Erreur',
        description: "Impossible de créer l'employé",
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
            <Plus className="w-4 h-4" />
            Nouvel employé
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouvel employé</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'employé. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <EmployeeForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
