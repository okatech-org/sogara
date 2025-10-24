import { useState, useCallback } from 'react'

interface FormState {
  isLoading: boolean
  error: string | null
  success: string | null
}

interface UseFormStateReturn {
  state: FormState
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
  clearError: () => void
  clearSuccess: () => void
  clearAll: () => void
  executeWithState: <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      successMessage?: string
    }
  ) => Promise<T | null>
}

export function useFormState(): UseFormStateReturn {
  const [state, setState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: null,
  })

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }))
  }, [])

  const setSuccess = useCallback((success: string | null) => {
    setState(prev => ({ ...prev, success, error: null }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const clearSuccess = useCallback(() => {
    setState(prev => ({ ...prev, success: null }))
  }, [])

  const clearAll = useCallback(() => {
    setState({ isLoading: false, error: null, success: null })
  }, [])

  const executeWithState = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void
        onError?: (error: Error) => void
        successMessage?: string
      }
    ): Promise<T | null> => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const result = await asyncFn()
        setLoading(false)
        
        if (options?.successMessage) {
          setSuccess(options.successMessage)
        }
        
        if (options?.onSuccess) {
          options.onSuccess(result)
        }
        
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        setError(errorMessage)
        setLoading(false)
        
        if (options?.onError) {
          options.onError(error instanceof Error ? error : new Error(errorMessage))
        }
        
        return null
      }
    },
    [setLoading, setError, setSuccess]
  )

  return {
    state,
    setLoading,
    setError,
    setSuccess,
    clearError,
    clearSuccess,
    clearAll,
    executeWithState,
  }
}
