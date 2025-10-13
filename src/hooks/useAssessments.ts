import { useMemo, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Assessment, AssessmentSubmission } from '@/types'
import { toast } from './use-toast'
import { Id } from '../../convex/_generated/dataModel'

export function useAssessments() {
  const assessmentsData = useQuery(api.assessments.list)
  const submissionsData = useQuery(api.assessments.listSubmissions, {})

  const createMutation = useMutation(api.assessments.create)
  const publishMutation = useMutation(api.assessments.publish)
  const assignMutation = useMutation(api.assessments.assign)
  const startMutation = useMutation(api.assessments.start)
  const submitMutation = useMutation(api.assessments.submit)
  const correctMutation = useMutation(api.assessments.correct)

  const assessments: Assessment[] = useMemo(
    () =>
      (assessmentsData || []).map((a: any) => ({
        id: a._id,
        title: a.title,
        description: a.description,
        type: a.type,
        category: a.category,
        duration: a.duration,
        passingScore: a.passingScore,
        totalPoints: a.totalPoints,
        questions: a.questions || [],
        isPublished: a.isPublished,
        createdBy: a.createdBy,
        instructions: a.instructions,
        validityMonths: a.validityMonths,
        certificateTemplate: a.certificateTemplate,
        createdAt: new Date(a._creationTime),
        updatedAt: new Date(a._creationTime),
      })),
    [assessmentsData],
  )

  const submissions: AssessmentSubmission[] = useMemo(
    () =>
      (submissionsData || []).map((s: any) => ({
        id: s._id,
        assessmentId: s.assessmentId,
        candidateId: s.candidateId,
        candidateType: s.candidateType,
        status: s.status,
        answers: s.answers || [],
        assignedAt: new Date(s.assignedAt),
        startedAt: s.startedAt ? new Date(s.startedAt) : undefined,
        submittedAt: s.submittedAt ? new Date(s.submittedAt) : undefined,
        correctedAt: s.correctedAt ? new Date(s.correctedAt) : undefined,
        score: s.score,
        totalPoints: s.totalPoints,
        earnedPoints: s.earnedPoints,
        isPassed: s.isPassed,
        correctorId: s.correctorId,
        correctorComments: s.correctorComments,
        questionGrades: s.questionGrades,
        certificateUrl: s.certificateUrl,
        certificateIssuedAt: s.certificateIssuedAt ? new Date(s.certificateIssuedAt) : undefined,
        expiryDate: s.expiryDate ? new Date(s.expiryDate) : undefined,
        createdAt: new Date(s._creationTime),
        updatedAt: new Date(s._creationTime),
      })),
    [submissionsData],
  )

  const createAssessment = async (
    assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt' | 'isPublished'>,
  ) => {
    try {
      await createMutation({
        ...assessmentData,
        createdBy: assessmentData.createdBy as Id<'employees'>,
        questions: assessmentData.questions,
      })

      toast({
        title: 'Évaluation créée',
        description: 'Le test a été créé avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible de créer l'évaluation.",
        variant: 'destructive',
      })
    }
  }

  const publishAssessment = async (assessmentId: string) => {
    try {
      await publishMutation({ id: assessmentId as Id<'assessments'> })
      toast({ title: 'Évaluation publiée', description: 'Prête à être assignée.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const assignToCandidate = async (
    assessmentId: string,
    candidateId: string,
    candidateType: 'employee' | 'visitor' | 'external',
  ) => {
    try {
      await assignMutation({
        assessmentId: assessmentId as Id<'assessments'>,
        candidateId,
        candidateType,
      })

      toast({
        title: 'Évaluation assignée',
        description: 'Le candidat recevra une notification.',
      })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const startAssessment = async (submissionId: string) => {
    try {
      await startMutation({ submissionId: submissionId as Id<'assessmentSubmissions'> })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const submitAnswers = async (submissionId: string, answers: any[]) => {
    try {
      await submitMutation({
        submissionId: submissionId as Id<'assessmentSubmissions'>,
        answers,
      })

      toast({
        title: 'Évaluation soumise',
        description: 'Vos réponses ont été envoyées au correcteur.',
      })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const correctSubmission = async (
    submissionId: string,
    questionGrades: any[],
    correctorComments: string,
    correctorId: string,
  ) => {
    try {
      const totalPoints = questionGrades.reduce((sum, g) => sum + g.maxPoints, 0)
      const earnedPoints = questionGrades.reduce((sum, g) => sum + g.pointsEarned, 0)
      const score = (earnedPoints / totalPoints) * 100

      // Récupérer l'assessment pour le passing score
      const submission = submissions.find(s => s.id === submissionId)
      const assessment = assessments.find(a => a.id === submission?.assessmentId)
      const isPassed = score >= (assessment?.passingScore || 60)

      await correctMutation({
        submissionId: submissionId as Id<'assessmentSubmissions'>,
        questionGrades,
        score,
        totalPoints,
        earnedPoints,
        isPassed,
        correctorComments,
        correctorId: correctorId as Id<'employees'>,
      })

      toast({
        title: isPassed ? 'Candidat admis' : 'Candidat ajourné',
        description: `Score: ${score.toFixed(1)}% - ${isPassed ? 'Réussite' : 'Échec'}`,
      })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    }
  }

  const getSubmissionsToCorrect = () => {
    return submissions.filter(s => s.status === 'submitted')
  }

  const getMyCandidateSubmissions = (candidateId: string) => {
    return submissions.filter(s => s.candidateId === candidateId)
  }

  return {
    assessments,
    submissions,
    loading: assessmentsData === undefined || submissionsData === undefined,
    createAssessment,
    publishAssessment,
    assignToCandidate,
    startAssessment,
    submitAnswers,
    correctSubmission,
    getSubmissionsToCorrect,
    getMyCandidateSubmissions,
  }
}
