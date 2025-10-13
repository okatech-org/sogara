import { useState, useCallback, useMemo, useEffect } from 'react'
import { HSEContentItem, HSEAssignment, HSEContentType, Employee, UserRole } from '@/types'
import { toast } from './use-toast'
import hseModulesData from '@/data/hse-training-modules.json'

const STORAGE_KEY_CONTENT = 'sogara_hse_content'
const STORAGE_KEY_ASSIGNMENTS = 'sogara_hse_assignments'

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key)
  return data
    ? JSON.parse(data, (k, value) => {
        if (k.includes('At') || k.includes('Date')) {
          return new Date(value)
        }
        return value
      })
    : []
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function useHSEContent() {
  const [content, setContent] = useState<HSEContentItem[]>(() =>
    getFromStorage(STORAGE_KEY_CONTENT),
  )
  const [assignments, setAssignments] = useState<HSEAssignment[]>(() =>
    getFromStorage(STORAGE_KEY_ASSIGNMENTS),
  )

  // Seed automatique si aucune donnée de contenu n'est présente
  useEffect(() => {
    if (content.length === 0) {
      try {
        const modules = (hseModulesData as any).hseTrainingModules || []
        const seeded: HSEContentItem[] = modules.slice(0, 6).map((m: any, idx: number) => ({
          id: `seed_content_${m.id}_${idx}`,
          type: 'training',
          title: m.title,
          description: m.description,
          priority:
            m.category === 'Critique'
              ? 'critical'
              : m.category === 'Obligatoire'
                ? 'high'
                : 'medium',
          trainingId: m.id,
          createdBy: 'HSE_SEED',
          createdAt: new Date(),
          targetRoles: m.requiredForRoles as UserRole[] | undefined,
        }))
        if (seeded.length > 0) {
          const updated = [...content, ...seeded]
          setContent(updated)
          saveToStorage(STORAGE_KEY_CONTENT, updated)
          console.log(`🌱 Seed HSE: ${seeded.length} contenus de formation ajoutés`)
        }
      } catch (e) {
        console.warn('Seed HSE échoué:', e)
      }
    }
  }, [content.length])

  const createContent = useCallback(
    (item: Omit<HSEContentItem, 'id' | 'createdAt'>) => {
      try {
        const newItem: HSEContentItem = {
          ...item,
          id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        }

        console.log('✅ Contenu créé:', newItem)

        const updated = [...content, newItem]
        setContent(updated)
        saveToStorage(STORAGE_KEY_CONTENT, updated)

        console.log('💾 Contenu sauvegardé dans localStorage')

        return newItem
      } catch (error) {
        console.error('❌ Erreur createContent:', error)
        return null
      }
    },
    [content],
  )

  const assignContent = useCallback(
    (
      contentId: string,
      employeeIds: string[],
      params: {
        dueDate?: Date
        reminderDate?: Date
        notes?: string
        sentBy: string
      },
    ) => {
      console.log('🔍 assignContent appelé', { contentId, employeeIds, params })
      console.log('📦 Contenu disponible:', content.length)

      let contentItem = content.find(c => c.id === contentId)
      // Fallback: recharger depuis le stockage si non trouvé en mémoire
      if (!contentItem) {
        const stored = getFromStorage<HSEContentItem>(STORAGE_KEY_CONTENT)
        contentItem = stored.find(c => c.id === contentId)
        if (contentItem && content.length === 0) {
          setContent(stored)
        }
      }

      if (!contentItem) {
        console.error('❌ Contenu non trouvé, contentId:', contentId)
        console.log(
          '📋 Content list:',
          content.map(c => ({ id: c.id, title: c.title })),
        )
        toast({
          title: 'Erreur',
          description: 'Contenu non trouvé dans le système',
          variant: 'destructive',
        })
        return []
      }

      console.log('✅ Contenu trouvé:', contentItem.title)

      const newAssignments: HSEAssignment[] = employeeIds.map((employeeId, index) => {
        const assignment = {
          id: `assign_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          contentId,
          contentType: contentItem.type,
          employeeId,
          status: 'sent' as const,
          assignedAt: new Date(),
          dueDate: params.dueDate,
          reminderDate: params.reminderDate,
          sentBy: params.sentBy,
          notes: params.notes,
          metadata: {
            trainingId: contentItem.trainingId,
            documentUrl: contentItem.documentUrl,
            priority: contentItem.priority,
          },
        }
        console.log(`✅ Assignment créé pour employé ${employeeId}:`, assignment)
        return assignment
      })

      const updated = [...assignments, ...newAssignments]
      setAssignments(updated)
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated)

      console.log('💾 Assignments sauvegardés:', newAssignments.length)

      toast({
        title: '✅ Envoi réussi',
        description: `${contentItem.title} envoyé à ${employeeIds.length} collaborateur(s)`,
      })

      return newAssignments
    },
    [content, assignments],
  )

  const getContentByType = useCallback(
    (type: HSEContentType) => {
      return content.filter(c => c.type === type)
    },
    [content],
  )

  const getSentHistory = useCallback(
    (sentBy: string) => {
      return assignments
        .filter(a => a.sentBy === sentBy)
        .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime())
    },
    [assignments],
  )

  const getAssignmentsByEmployee = useCallback(
    (employeeId: string) => {
      return assignments.filter(a => a.employeeId === employeeId)
    },
    [assignments],
  )

  const updateAssignmentStatus = useCallback(
    (
      assignmentId: string,
      status: HSEAssignment['status'],
      additionalData?: Partial<HSEAssignment>,
    ) => {
      const updated = assignments.map(a =>
        a.id === assignmentId ? { ...a, status, ...additionalData } : a,
      )
      setAssignments(updated)
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated)
    },
    [assignments],
  )

  const getStats = useMemo(
    () => ({
      totalContent: content.length,
      totalAssignments: assignments.length,
      pendingAssignments: assignments.filter(a => a.status === 'sent' || a.status === 'received')
        .length,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      byType: {
        training: content.filter(c => c.type === 'training').length,
        alert: content.filter(c => c.type === 'alert').length,
        document: content.filter(c => c.type === 'document').length,
      },
    }),
    [content, assignments],
  )

  return {
    content,
    assignments,
    createContent,
    assignContent,
    getContentByType,
    getSentHistory,
    getAssignmentsByEmployee,
    updateAssignmentStatus,
    stats: getStats,
  }
}
