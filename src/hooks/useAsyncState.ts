import { useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncStateReturn<T> extends AsyncState<T> {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setData: (data: T | null) => void
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>
  reset: () => void
}

export function useAsyncState<T>(initialData: T | null = null): UseAsyncStateReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }))
  }, [])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data, loading: false, error: null }))
  }, [])

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      setData(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      setError(errorMessage)
      return null
    }
  }, [setLoading, setError, setData])

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    })
  }, [initialData])

  return {
    ...state,
    setLoading,
    setError,
    setData,
    execute,
    reset,
  }
}
