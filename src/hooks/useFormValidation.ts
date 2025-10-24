import { useState, useCallback } from 'react'
import { z } from 'zod'

interface ValidationError {
  field: string
  message: string
}

interface UseFormValidationReturn {
  errors: Record<string, string>
  isValid: boolean
  validateField: (field: string, value: any, schema: z.ZodSchema) => boolean
  validateForm: (data: any, schema: z.ZodSchema) => boolean
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((field: string, value: any, schema: z.ZodSchema): boolean => {
    try {
      schema.parse(value)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path.includes(field))
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [field]: fieldError.message
          }))
        }
      }
      return false
    }
  }, [])

  const validateForm = useCallback((data: any, schema: z.ZodSchema): boolean => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          const field = err.path.join('.')
          newErrors[field] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [])

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }))
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.keys(errors).length === 0

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    setError,
    clearError,
    clearAllErrors,
  }
}
