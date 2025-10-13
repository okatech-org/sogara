import { useMemo, useCallback, useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Vacation } from '@/types'
import { toast } from './use-toast'
import { Id } from '../../convex/_generated/dataModel'

export function useVacations() {
  const vacationsData = useQuery(api.vacations.list)
  const createMutation = useMutation(api.vacations.create)
  const updateMutation = useMutation(api.vacations.update)
  const checkInMutation = useMutation(api.vacations.checkIn)
  const checkOutMutation = useMutation(api.vacations.checkOut)
  const removeMutation = useMutation(api.vacations.remove)

  const vacations: Vacation[] = useMemo(
    () =>
      (vacationsData || []).map((v: any) => ({
        id: v._id,
        date: new Date(v.date),
        type: v.type,
        startTime: new Date(v.startTime),
        endTime: new Date(v.endTime),
        status: v.status,
        employeeId: v.employeeId,
        siteId: v.siteId,
        siteName: v.siteName,
        plannedHours: v.plannedHours,
        actualHours: v.actualHours,
        overtimeHours: v.overtimeHours,
        nightHours: v.nightHours,
        checkInTime: v.checkInTime ? new Date(v.checkInTime) : undefined,
        checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
        isValidated: v.isValidated,
        validatedBy: v.validatedBy,
        validatedAt: v.validatedAt ? new Date(v.validatedAt) : undefined,
        notes: v.notes,
        createdAt: new Date(v._creationTime),
        updatedAt: new Date(v._creationTime),
      })),
    [vacationsData],
  )

  const createVacation = async (
    vacationData: Omit<Vacation, 'id' | 'createdAt' | 'updatedAt' | 'isValidated'>,
  ) => {
    try {
      await createMutation({
        date: vacationData.date.getTime(),
        type: vacationData.type,
        startTime: vacationData.startTime.getTime(),
        endTime: vacationData.endTime.getTime(),
        employeeId: vacationData.employeeId as Id<'employees'>,
        siteId: vacationData.siteId,
        siteName: vacationData.siteName || '',
        plannedHours: vacationData.plannedHours,
        status: vacationData.status,
        notes: vacationData.notes,
      })

      toast({
        title: 'Vacation créée',
        description: 'La vacation a été ajoutée au planning.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la vacation.',
        variant: 'destructive',
      })
    }
  }

  const checkIn = async (vacationId: string) => {
    try {
      await checkInMutation({ id: vacationId as Id<'vacations'> })
      toast({ title: 'Pointage effectué', description: 'Début de vacation enregistré.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const checkOut = async (vacationId: string, actualHours: number, overtimeHours?: number) => {
    try {
      await checkOutMutation({
        id: vacationId as Id<'vacations'>,
        actualHours,
        overtimeHours,
      })
      toast({ title: 'Fin de vacation', description: 'Pointage de sortie enregistré.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const getVacationsByEmployee = (employeeId: string) => {
    return vacations.filter(v => v.employeeId === employeeId)
  }

  const getVacationsByMonth = (month: number, year: number) => {
    return vacations.filter(v => {
      const date = new Date(v.date)
      return date.getMonth() + 1 === month && date.getFullYear() === year
    })
  }

  const getMyVacations = (employeeId: string, month?: number, year?: number) => {
    let filtered = vacations.filter(v => v.employeeId === employeeId)

    if (month && year) {
      filtered = filtered.filter(v => {
        const date = new Date(v.date)
        return date.getMonth() + 1 === month && date.getFullYear() === year
      })
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const getTotalHours = (employeeId: string, month: number, year: number) => {
    const employeeVacations = getMyVacations(employeeId, month, year)
    return employeeVacations.reduce((sum, v) => sum + (v.actualHours || v.plannedHours), 0)
  }

  return {
    vacations,
    loading: vacationsData === undefined,
    createVacation,
    checkIn,
    checkOut,
    getVacationsByEmployee,
    getVacationsByMonth,
    getMyVacations,
    getTotalHours,
  }
}
