import { useMemo, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CertificationPath, CertificationPathProgress } from '@/types'
import { toast } from './use-toast'
import { Id } from '../../convex/_generated/dataModel'
import { useAuth } from '@/contexts/AppContext'

export function useCertificationPaths() {
  const { currentUser } = useAuth()
  const pathsData = useQuery(api.certificationPaths.list)
  const progressData = useQuery(api.certificationPaths.getMyProgress, {
    candidateId: currentUser?.id || '',
  })

  const createMutation = useMutation(api.certificationPaths.create)
  const publishMutation = useMutation(api.certificationPaths.publish)
  const assignMutation = useMutation(api.certificationPaths.assignToCandidate)
  const startTrainingMutation = useMutation(api.certificationPaths.startTraining)
  const completeTrainingMutation = useMutation(api.certificationPaths.completeTraining)
  const completeEvaluationMutation = useMutation(api.certificationPaths.completeEvaluation)

  const paths: CertificationPath[] = useMemo(
    () =>
      (pathsData || []).map((p: any) => ({
        id: p._id,
        title: p.title,
        description: p.description,
        trainingModuleId: p.trainingModuleId,
        trainingTitle: p.trainingTitle,
        trainingDuration: p.trainingDuration,
        assessmentId: p.assessmentId,
        assessmentTitle: p.assessmentTitle,
        daysBeforeAssessment: p.daysBeforeAssessment,
        assessmentDuration: p.assessmentDuration,
        passingScore: p.passingScore,
        habilitationName: p.habilitationName,
        habilitationCode: p.habilitationCode,
        habilitationValidity: p.habilitationValidity,
        createdBy: p.createdBy,
        isPublished: p.isPublished,
        createdAt: new Date(p._creationTime),
        updatedAt: new Date(p._creationTime),
      })),
    [pathsData],
  )

  // Fallback localStorage pour usage hors-ligne / serveur Convex non démarré
  const STORAGE_KEY = 'sogara_certification_progress'

  const loadLocalProgress = (): any[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const saveLocalProgress = (items: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }

  const getMyProgress = useCallback(
    (candidateId: string) => {
      const remote = (progressData || []).map((p: any) => ({
        id: p._id,
        pathId: p.pathId,
        candidateId: p.candidateId,
        candidateType: p.candidateType,
        status: p.status,
        trainingAssignmentId: p.trainingAssignmentId,
        trainingStartedAt: p.trainingStartedAt ? new Date(p.trainingStartedAt) : undefined,
        trainingCompletedAt: p.trainingCompletedAt ? new Date(p.trainingCompletedAt) : undefined,
        trainingScore: p.trainingScore,
        assessmentSubmissionId: p.assessmentSubmissionId,
        evaluationAvailableDate: p.evaluationAvailableDate
          ? new Date(p.evaluationAvailableDate)
          : undefined,
        evaluationStartedAt: p.evaluationStartedAt ? new Date(p.evaluationStartedAt) : undefined,
        evaluationSubmittedAt: p.evaluationSubmittedAt
          ? new Date(p.evaluationSubmittedAt)
          : undefined,
        evaluationCorrectedAt: p.evaluationCorrectedAt
          ? new Date(p.evaluationCorrectedAt)
          : undefined,
        evaluationScore: p.evaluationScore,
        evaluationPassed: p.evaluationPassed,
        habilitationGrantedAt: p.habilitationGrantedAt
          ? new Date(p.habilitationGrantedAt)
          : undefined,
        habilitationExpiryDate: p.habilitationExpiryDate
          ? new Date(p.habilitationExpiryDate)
          : undefined,
        certificateUrl: p.certificateUrl,
        assignedBy: p.assignedBy,
        assignedAt: new Date(p.assignedAt),
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
        createdAt: new Date(p._creationTime),
        updatedAt: new Date(p._creationTime),
      })) as CertificationPathProgress[]

      const local = loadLocalProgress()
        .filter((p: any) => p.candidateId === candidateId)
        .map((p: any) => ({
          id: p.id,
          pathId: p.pathId,
          candidateId: p.candidateId,
          candidateType: p.candidateType,
          status: p.status,
          trainingAssignmentId: p.trainingAssignmentId,
          trainingStartedAt: p.trainingStartedAt ? new Date(p.trainingStartedAt) : undefined,
          trainingCompletedAt: p.trainingCompletedAt ? new Date(p.trainingCompletedAt) : undefined,
          trainingScore: p.trainingScore,
          assessmentSubmissionId: p.assessmentSubmissionId,
          evaluationAvailableDate: p.evaluationAvailableDate
            ? new Date(p.evaluationAvailableDate)
            : undefined,
          evaluationStartedAt: p.evaluationStartedAt ? new Date(p.evaluationStartedAt) : undefined,
          evaluationSubmittedAt: p.evaluationSubmittedAt
            ? new Date(p.evaluationSubmittedAt)
            : undefined,
          evaluationCorrectedAt: p.evaluationCorrectedAt
            ? new Date(p.evaluationCorrectedAt)
            : undefined,
          evaluationScore: p.evaluationScore,
          evaluationPassed: p.evaluationPassed,
          habilitationGrantedAt: p.habilitationGrantedAt
            ? new Date(p.habilitationGrantedAt)
            : undefined,
          habilitationExpiryDate: p.habilitationExpiryDate
            ? new Date(p.habilitationExpiryDate)
            : undefined,
          certificateUrl: p.certificateUrl,
          assignedBy: p.assignedBy,
          assignedAt: p.assignedAt ? new Date(p.assignedAt) : new Date(),
          completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        })) as CertificationPathProgress[]

      return [...local, ...remote]
    },
    [progressData],
  )

  const createPath = async (
    pathData: Omit<CertificationPath, 'id' | 'createdAt' | 'updatedAt' | 'isPublished'>,
  ) => {
    try {
      await createMutation({
        ...pathData,
        createdBy: pathData.createdBy as Id<'employees'>,
        assessmentId: pathData.assessmentId as Id<'assessments'>,
      })

      toast({
        title: 'Parcours créé',
        description: 'Le parcours de certification a été créé.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const assignToCandidate = async (
    pathId: string,
    candidateId: string,
    candidateType: 'employee' | 'external',
    assignedBy: string,
  ) => {
    try {
      // Time-out rapide si Convex est hors-ligne (WebSocket indisponible)
      const timeoutMs = 2000
      const result = await Promise.race([
        assignMutation({
          pathId: pathId as Id<'certificationPaths'>,
          candidateId,
          candidateType,
          assignedBy: assignedBy as Id<'employees'>,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ])

      return { success: true, result }
    } catch (error: any) {
      const local = loadLocalProgress()
      const now = new Date()
      const localProgress = {
        id: `local_progress_${Date.now()}`,
        pathId,
        candidateId,
        candidateType,
        status: 'not_started',
        assignedBy,
        assignedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
      local.push(localProgress)
      saveLocalProgress(local)

      return { success: true, result: localProgress.id, offline: true }
    }
  }

  const completeTraining = async (
    progressId: string,
    trainingScore: number,
    daysBeforeAssessment: number,
  ) => {
    try {
      await completeTrainingMutation({
        progressId: progressId as Id<'certificationPathProgress'>,
        trainingScore,
        daysBeforeAssessment,
      })
    } catch (error: any) {
      // Fallback local: mise à jour de la progression
      const items = loadLocalProgress()
      const idx = items.findIndex((p: any) => p.id === progressId)
      if (idx !== -1) {
        const now = new Date()
        const available = new Date(now.getTime() + daysBeforeAssessment * 24 * 60 * 60 * 1000)
        items[idx] = {
          ...items[idx],
          trainingCompletedAt: now.toISOString(),
          trainingScore,
          evaluationAvailableDate: available.toISOString(),
          status: 'evaluation_available',
          updatedAt: now.toISOString(),
        }
        saveLocalProgress(items)
        toast({
          title: 'Formation complétée (hors ligne)',
          description: 'Évaluation débloquée selon le délai configuré.',
        })
      } else {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

  return {
    paths,
    loading: pathsData === undefined,
    createPath,
    assignToCandidate,
    getMyProgress,
    completeTraining,
  }
}
