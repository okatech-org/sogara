import { toast } from '@/hooks/use-toast'

// Configuration de l'API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 secondes
  retryAttempts: 1, // Réduit à 1 tentative pour éviter le spam de logs
  retryDelay: 1000, // 1 seconde
  healthcheck: String(import.meta.env.VITE_API_HEALTHCHECK || 'true') !== 'false',
}

// Interface pour la réponse API standardisée
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Interface pour les options de requête
interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  skipErrorToast?: boolean
  retries?: number
}

class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.token = localStorage.getItem('accessToken')

    // Vérifier la connectivité au démarrage (optionnel)
    if (API_CONFIG.healthcheck) {
      this.checkConnection()
    }
  }

  /**
   * Vérifier la connexion au serveur
   */
  private async checkConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        timeout: 5000,
      } as any)

      if (!response.ok) {
        console.warn('⚠️ Serveur API non disponible, fallback sur données locales')
      } else {
        console.info('✅ Connexion API établie')
      }
    } catch (error) {
      console.warn('⚠️ Serveur API non accessible, fallback sur données locales')
    }
  }

  /**
   * Définir le token d'authentification
   */
  setToken(token: string | null): void {
    this.token = token
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  /**
   * Obtenir le token d'authentification
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Construire les headers de requête
   */
  private buildHeaders(options: RequestOptions = {}): Headers {
    const headers = new Headers()

    headers.set('Content-Type', 'application/json')

    if (!options.skipAuth && this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    return headers
  }

  /**
   * Gérer les erreurs de requête
   */
  private async handleError(response: Response, options: RequestOptions): Promise<never> {
    let errorData: any = {}

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: 'Erreur de communication avec le serveur' }
    }

    // Gestion des erreurs d'authentification
    if (response.status === 401) {
      this.handleAuthError(errorData)
      throw new Error('Session expirée')
    }

    // Gestion des erreurs de validation
    if (response.status === 400 && errorData.errors) {
      const validationErrors = errorData.errors
        .map((err: any) => `${err.field}: ${err.message}`)
        .join(', ')
      throw new Error(`Erreur de validation: ${validationErrors}`)
    }

    const errorMessage = errorData.message || `Erreur ${response.status}: ${response.statusText}`

    // Afficher un toast d'erreur sauf si désactivé
    if (!options.skipErrorToast) {
      toast({
        title: 'Erreur API',
        description: errorMessage,
        variant: 'destructive',
      })
    }

    throw new Error(errorMessage)
  }

  /**
   * Gérer les erreurs d'authentification
   */
  private handleAuthError(errorData: any): void {
    console.warn('Token expiré ou invalide, déconnexion...')

    this.setToken(null)

    // Déclencher un événement personnalisé pour notifier l'application
    window.dispatchEvent(
      new CustomEvent('auth:logout', {
        detail: { reason: 'token_expired', message: errorData.message },
      }),
    )

    toast({
      title: 'Session expirée',
      description: 'Vous devez vous reconnecter',
      variant: 'destructive',
    })
  }

  /**
   * Retry logic pour les requêtes échouées
   */
  private async withRetry<T>(
    requestFn: () => Promise<T>,
    options: RequestOptions = {},
  ): Promise<T> {
    const maxRetries = options.retries ?? API_CONFIG.retryAttempts

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        // Ne pas retry sur les erreurs d'authentification ou de validation
        if (
          error instanceof Error &&
          (error.message.includes('Session expirée') ||
            error.message.includes('Erreur de validation'))
        ) {
          throw error
        }

        // Si c'est le dernier essai, lancer l'erreur
        if (attempt === maxRetries) {
          throw error
        }

        // Attendre avant le prochain essai
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (attempt + 1)))
        console.warn(`Tentative ${attempt + 1}/${maxRetries} échouée, nouvel essai...`)
      }
    }

    throw new Error('Nombre maximum de tentatives atteint')
  }

  /**
   * Requête HTTP générique
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const url = `${this.baseURL}${endpoint}`
      const headers = this.buildHeaders(options)

      const config: RequestInit = {
        ...options,
        headers,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
      }

      console.debug(`API Request: ${config.method || 'GET'} ${url}`)

      const response = await fetch(url, config)

      if (!response.ok) {
        await this.handleError(response, options)
      }

      const data: ApiResponse<T> = await response.json()

      console.debug(`API Response: ${response.status} - ${data.message}`)

      return data
    }, options)
  }

  /**
   * Requête GET
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * Requête POST
   */
  async post<T>(
    endpoint: string,
    data: any = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Requête PUT
   */
  async put<T>(
    endpoint: string,
    data: any = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Requête PATCH
   */
  async patch<T>(
    endpoint: string,
    data: any = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Requête DELETE
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Upload de fichier
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const url = `${this.baseURL}${endpoint}`
      const headers = new Headers()

      if (!options.skipAuth && this.token) {
        headers.set('Authorization', `Bearer ${this.token}`)
      }

      // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)

      const config: RequestInit = {
        ...options,
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(API_CONFIG.timeout * 2), // Plus de temps pour les uploads
      }

      console.debug(`API Upload: POST ${url}`)

      const response = await fetch(url, config)

      if (!response.ok) {
        await this.handleError(response, options)
      }

      const data: ApiResponse<T> = await response.json()

      console.debug(`API Upload Response: ${response.status} - ${data.message}`)

      return data
    }, options)
  }

  /**
   * Test de connexion API
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.get('/auth/validate', {
        skipErrorToast: true,
        retries: 0,
      })
      return response.success
    } catch {
      return false
    }
  }

  /**
   * Obtenir des statistiques de l'API
   */
  async getApiStats(): Promise<{
    connected: boolean
    responseTime: number
    version?: string
  }> {
    if (!API_CONFIG.healthcheck) {
      return { connected: false, responseTime: 0 }
    }
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        timeout: 5000,
      } as any)

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        return {
          connected: true,
          responseTime,
          version: data.version,
        }
      } else {
        return {
          connected: false,
          responseTime,
        }
      }
    } catch {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
      }
    }
  }
}

// Instance singleton de l'API service
export const apiService = new ApiService()

// Services spécialisés pour chaque entité
export const authAPI = {
  login: (matricule: string, password: string) =>
    apiService.post('/auth/login', { matricule, password }, { skipAuth: true }),

  register: (employeeData: any) => apiService.post('/auth/register', employeeData),

  logout: () => apiService.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiService.post('/auth/refresh', { refreshToken }, { skipAuth: true }),

  validateToken: () => apiService.get('/auth/validate'),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    apiService.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  getProfile: () => apiService.get('/auth/profile'),
}

export const employeesAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/employees${queryString}`)
  },

  getById: (id: string) => apiService.get(`/employees/${id}`),

  create: (employeeData: any) => apiService.post('/employees', employeeData),

  update: (id: string, employeeData: any) => apiService.put(`/employees/${id}`, employeeData),

  delete: (id: string) => apiService.delete(`/employees/${id}`),

  getByRole: (role: string) => apiService.get(`/employees/by-role/${role}`),

  getStats: () => apiService.get('/employees/stats'),

  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return apiService.upload(`/employees/${id}/photo`, formData)
  },
}

export const visitsAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/visits${queryString}`)
  },

  getById: (id: string) => apiService.get(`/visits/${id}`),

  create: (visitData: any) => apiService.post('/visits', visitData),

  update: (id: string, visitData: any) => apiService.patch(`/visits/${id}`, visitData),

  checkin: (id: string, badgeNumber?: string) =>
    apiService.post(`/visits/${id}/checkin`, { badgeNumber }),

  checkout: (id: string, notes?: string) => 
    apiService.post(`/visits/${id}/checkout`, { notes }),

  cancel: (id: string, reason?: string) =>
    apiService.post(`/visits/${id}/cancel`, { reason }),

  delete: (id: string) => apiService.delete(`/visits/${id}`),

  getTodaysVisits: () => apiService.get('/visits/today/list'),

  getByDate: (date: string) => apiService.get(`/visits/by-date/${date}`),

  getStats: () => apiService.get('/visits/stats/overview'),
}

export const packagesAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/packages${queryString}`)
  },

  getById: (id: string) => apiService.get(`/packages/${id}`),

  create: (packageData: any) => apiService.post('/packages', packageData),

  update: (id: string, packageData: any) => apiService.patch(`/packages/${id}`, packageData),

  pickup: (id: string, pickedUpBy?: string) =>
    apiService.post(`/packages/${id}/pickup`, { pickedUpBy }),

  deliver: (id: string, deliveredBy?: string, notes?: string) =>
    apiService.post(`/packages/${id}/deliver`, { deliveredBy, notes }),

  cancel: (id: string, reason?: string) =>
    apiService.post(`/packages/${id}/cancel`, { reason }),

  delete: (id: string) => apiService.delete(`/packages/${id}`),

  getPending: () => apiService.get('/packages/pending/list'),

  getByRecipient: (employeeId: string) => apiService.get(`/packages/by-recipient/${employeeId}`),

  getStats: () => apiService.get('/packages/stats/overview'),
}

export const equipmentAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/equipment${queryString}`)
  },

  getById: (id: string) => apiService.get(`/equipment/${id}`),

  create: (equipmentData: any) => apiService.post('/equipment', equipmentData),

  update: (id: string, equipmentData: any) => apiService.patch(`/equipment/${id}`, equipmentData),

  startMaintenance: (id: string, reason: string, assignedTo?: string) =>
    apiService.post(`/equipment/${id}/maintenance`, { reason, assignedTo }),

  completeMaintenance: (id: string, notes?: string) =>
    apiService.post(`/equipment/${id}/maintenance/complete`, { notes }),

  markOutOfService: (id: string, reason: string) =>
    apiService.post(`/equipment/${id}/out-of-service`, { reason }),

  delete: (id: string) => apiService.delete(`/equipment/${id}`),

  getMaintenance: () => apiService.get('/equipment/maintenance/list'),

  getByType: (type: string) => apiService.get(`/equipment/by-type/${type}`),

  getStats: () => apiService.get('/equipment/stats/overview'),
}

export const hseAPI = {
  // Incidents
  getIncidents: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/hse/incidents${queryString}`)
  },

  createIncident: (incidentData: any) => apiService.post('/hse/incidents', incidentData),

  getIncidentById: (id: string) => apiService.get(`/hse/incidents/${id}`),

  updateIncident: (id: string, incidentData: any) => apiService.patch(`/hse/incidents/${id}`, incidentData),

  closeIncident: (id: string, notes?: string) => apiService.post(`/hse/incidents/${id}/close`, { notes }),

  // Trainings
  getTrainings: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/hse/trainings${queryString}`)
  },

  createTraining: (trainingData: any) => apiService.post('/hse/trainings', trainingData),

  getTrainingById: (id: string) => apiService.get(`/hse/trainings/${id}`),

  updateTraining: (id: string, trainingData: any) => apiService.patch(`/hse/trainings/${id}`, trainingData),

  enrollEmployee: (id: string, employeeData: any) => apiService.post(`/hse/trainings/${id}/enroll`, employeeData),

  validateTraining: (id: string, notes?: string) => apiService.post(`/hse/trainings/${id}/validate`, { notes }),

  // Compliance
  getCompliance: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/hse/compliance${queryString}`)
  },

  createCompliance: (complianceData: any) => apiService.post('/hse/compliance', complianceData),

  getComplianceById: (id: string) => apiService.get(`/hse/compliance/${id}`),

  updateCompliance: (id: string, complianceData: any) => apiService.patch(`/hse/compliance/${id}`, complianceData),

  validateCompliance: (id: string, notes?: string) => apiService.post(`/hse/compliance/${id}/validate`, { notes }),

  // Statistics
  getStats: () => apiService.get('/hse/stats/overview'),

  getIncidentStats: () => apiService.get('/hse/stats/incidents'),

  getTrainingStats: () => apiService.get('/hse/stats/trainings'),

  getComplianceStats: () => apiService.get('/hse/stats/compliance'),
}

export const postsAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiService.get(`/posts${queryString}`)
  },

  getById: (id: string) => apiService.get(`/posts/${id}`),

  create: (postData: any) => apiService.post('/posts', postData),

  update: (id: string, postData: any) => apiService.patch(`/posts/${id}`, postData),

  delete: (id: string) => apiService.delete(`/posts/${id}`),

  publish: (id: string) => apiService.post(`/posts/${id}/publish`),

  unpublish: (id: string) => apiService.post(`/posts/${id}/unpublish`),

  addComment: (id: string, content: string) => apiService.post(`/posts/${id}/comments`, { content }),

  deleteComment: (id: string, commentId: string) => apiService.delete(`/posts/${id}/comments/${commentId}`),

  like: (id: string) => apiService.post(`/posts/${id}/like`),

  unlike: (id: string) => apiService.delete(`/posts/${id}/like`),

  getByCategory: (category: string) => apiService.get(`/posts/category/${category}`),

  getTrending: () => apiService.get('/posts/trending/list'),

  getStats: () => apiService.get('/posts/stats/overview'),
}

// Export par défaut du service principal
export default apiService
