import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, X } from 'lucide-react'
import { Employee } from '@/types'

interface DeleteConfirmationProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
}

export function DeleteConfirmation({ employee, isOpen, onClose, onConfirm, loading = false }: DeleteConfirmationProps) {
  if (!isOpen || !employee) return null

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmation de suppression
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Supprimer {employee.firstName} {employee.lastName} ?
            </h3>
            <p className="text-muted-foreground mb-4">
              Cette action est irréversible. L'employé sera définitivement supprimé du système.
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Informations de l'employé :</h4>
            <div className="text-sm space-y-1">
              <p><strong>Matricule :</strong> {employee.matricule}</p>
              <p><strong>Service :</strong> {employee.service}</p>
              <p><strong>Rôles :</strong> {employee.roles.join(', ')}</p>
              <p><strong>Statut :</strong> {employee.status}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
