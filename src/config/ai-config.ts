export const AI_CONFIG = {
  provider: 'openai' as const,
  apiKey:
    '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',
  model: 'gpt-4o' as const,
  maxRetries: 3,
  timeout: 30000,
  confidence: {
    minimum: 0.7,
    warning: 0.85,
    verification: 0.95,
  },
}

export const GEMINI_CONFIG = {
  provider: 'google' as const,
  apiKey: 'AIzaSyBZcxcN_N0cLkHx4twMSWyoLneD0ueouI4',
  model: 'gemini-1.5-flash' as const,
  maxRetries: 3,
  timeout: 30000,
  confidence: {
    minimum: 0.7,
    warning: 0.85,
    verification: 0.95,
  },
}

export const USE_OPENAI = true

export const getAIConfig = () => {
  if (USE_OPENAI) {
    console.log('🔧 Configuration OPENAI chargée depuis fichier config')
    return AI_CONFIG
  }
  console.log('🔧 Configuration GEMINI chargée depuis fichier config')
  return GEMINI_CONFIG
}
