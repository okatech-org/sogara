import { useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Visit, Visitor, VisitStatus } from '@/types'
import { toast } from '@/hooks/use-toast'
import { Id } from '../../convex/_generated/dataModel'

export function useVisits() {
  // Queries Convex
  const visitsData = useQuery(api.visits.list)
  const visitorsData = useQuery(api.visitors.list)

  // Mutations Convex
  const createVisitMutation = useMutation(api.visits.create)
  const createVisitorMutation = useMutation(api.visitors.create)
  const checkInMutation = useMutation(api.visits.checkIn)
  const checkOutMutation = useMutation(api.visits.checkOut)
  const updateVisitMutation = useMutation(api.visits.update)

  // Mapper les données Convex
  const visits: Visit[] = (visitsData || []).map((v: any) => ({
    id: v._id,
    visitorId: v.visitorId,
    hostEmployeeId: v.hostEmployeeId,
    scheduledAt: new Date(v.scheduledAt),
    checkedInAt: v.checkedInAt ? new Date(v.checkedInAt) : undefined,
    checkedOutAt: v.checkedOutAt ? new Date(v.checkedOutAt) : undefined,
    status: v.status,
    purpose: v.purpose,
    badgeNumber: v.badgeNumber,
    notes: v.notes,
    createdAt: new Date(v._creationTime),
    updatedAt: new Date(v._creationTime),
  }))

  const visitors: Visitor[] = (visitorsData || []).map((v: any) => ({
    id: v._id,
    firstName: v.firstName,
    lastName: v.lastName,
    company: v.company,
    idDocument: v.idDocument,
    documentType: v.documentType,
    phone: v.phone,
    email: v.email,
    photo: v.photo,
    createdAt: new Date(v._creationTime),
  }))

  const createVisitor = async (visitorData: Omit<Visitor, 'id' | 'createdAt'>) => {
    try {
      await createVisitorMutation({
        firstName: visitorData.firstName,
        lastName: visitorData.lastName,
        company: visitorData.company,
        idDocument: visitorData.idDocument,
        documentType: visitorData.documentType,
        phone: visitorData.phone,
        email: visitorData.email,
        photo: visitorData.photo,
        nationality: visitorData.nationality,
        birthDate: visitorData.birthDate,
      })

      toast({
        title: 'Visiteur enregistré',
        description: `${visitorData.firstName} ${visitorData.lastName} a été ajouté.`,
      })

      return { success: true }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le visiteur.',
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  const createVisit = async (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createVisitMutation({
        visitorId: visitData.visitorId as Id<'visitors'>,
        hostEmployeeId: visitData.hostEmployeeId as Id<'employees'>,
        scheduledAt: visitData.scheduledAt.getTime(),
        purpose: visitData.purpose,
        notes: visitData.notes,
        badgeNumber: visitData.badgeNumber,
      })

      toast({
        title: 'Visite créée',
        description: 'La visite a été enregistrée avec succès.',
      })

      return { success: true }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la visite.',
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  const updateVisitStatus = async (visitId: string, status: VisitStatus) => {
    try {
      if (status === 'in_progress') {
        await checkInMutation({ id: visitId as Id<'visits'> })
      } else if (status === 'checked_out') {
        await checkOutMutation({ id: visitId as Id<'visits'> })
      } else {
        await updateVisitMutation({
          id: visitId as Id<'visits'>,
          status,
        })
      }

      const statusMessages = {
        waiting: 'Le visiteur est en attente',
        in_progress: 'Le visiteur est arrivé',
        checked_out: 'Le visiteur est sorti',
        expected: 'Visite programmée',
      }

      toast({
        title: 'Statut mis à jour',
        description: statusMessages[status],
      })

      return { success: true }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  const getTodaysVisits = () => {
    const today = new Date().toDateString()
    return visits.filter(visit => visit.scheduledAt.toDateString() === today)
  }

  const getVisitsByEmployee = (employeeId: string) => {
    return visits.filter(visit => visit.hostEmployeeId === employeeId)
  }

  const searchVisitors = (query: string) => {
    const search = query.toLowerCase()
    return visitors.filter(
      visitor =>
        visitor.firstName.toLowerCase().includes(search) ||
        visitor.lastName.toLowerCase().includes(search) ||
        visitor.company.toLowerCase().includes(search),
    )
  }

  const getVisitorById = (id: string) => {
    return visitors.find(visitor => visitor.id === id)
  }

  const visitsByStatus = useMemo(() => {
    return visits.reduce<Record<VisitStatus, Visit[]>>(
      (acc, visit) => {
        acc[visit.status] ||= []
        acc[visit.status].push(visit)
        return acc
      },
      { expected: [], waiting: [], in_progress: [], checked_out: [] },
    )
  }, [visits])

  return {
    visits,
    visitors,
    isLoading: visitsData === undefined || visitorsData === undefined,
    createVisitor,
    createVisit,
    updateVisitStatus,
    getTodaysVisits,
    getVisitsByEmployee,
    searchVisitors,
    getVisitorById,
    visitsByStatus,
  }
}
