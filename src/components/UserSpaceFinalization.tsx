import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner'
import { ActionButton } from '@/components/ui/ActionButton'
import { FormError } from '@/components/ui/FormError'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { useAsyncState } from '@/hooks/useAsyncState'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useNotifications } from '@/hooks/useNotifications'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { ResponsiveLayout } from '@/components/ui/ResponsiveLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { PatternValidation } from '@/components/PatternValidation'
import { 
  User, 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Types pour la finalisation
interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio: string
  phone?: string
  department: string
  role: string
  lastLogin?: Date
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    language: string
  }
}

interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'team'
    showEmail: boolean
    showPhone: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
  }
}

// Schéma de validation
const profileSchema = {
  firstName: (value: string) => value.trim().length >= 2 || 'Prénom requis (min 2 caractères)',
  lastName: (value: string) => value.trim().length >= 2 || 'Nom requis (min 2 caractères)',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email invalide',
  phone: (value: string) => !value || /^[0-9+\-() ]*$/.test(value) || 'Téléphone invalide',
  bio: (value: string) => value.length <= 500 || 'Bio trop longue (max 500 caractères)',
}

export function UserSpaceFinalization() {
  // États principaux
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // États asynchrones
  const profileState = useAsyncState<UserProfile>()
  const settingsState = useAsyncState<UserSettings>()
  const saveState = useAsyncState()
  
  // Validation
  const validation = useFormValidation()
  
  // Notifications
  const notifications = useNotifications()
  
  // États locaux
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    department: '',
    role: '',
    preferences: {
      theme: 'auto',
      notifications: true,
      language: 'fr'
    }
  })
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'auto',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: true,
      showPhone: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    }
  })

  // Charger les données au montage
  useEffect(() => {
    loadUserData()
    
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem('sogara-theme') as 'light' | 'dark' | 'auto' | null
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setSettings(prev => ({ ...prev, theme: savedTheme }))
      
      // Appliquer immédiatement le thème sauvegardé
      const root = document.documentElement
      if (savedTheme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else if (savedTheme === 'light') {
        root.classList.add('light')
        root.classList.remove('dark')
      } else {
        // Mode automatique basé sur les préférences système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark')
          root.classList.remove('light')
        } else {
          root.classList.add('light')
          root.classList.remove('dark')
        }
      }
    }
  }, [])

  // Charger les données utilisateur
  const loadUserData = useCallback(async () => {
    await profileState.execute(async () => {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@sogara.com',
        bio: 'Responsable HSE avec 10 ans d\'expérience',
        department: 'HSE',
        role: 'HSE_MANAGER',
        lastLogin: new Date(),
        preferences: {
          theme: 'auto',
          notifications: true,
          language: 'fr'
        }
      }
    })
    
    await settingsState.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        theme: 'auto',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profileVisibility: 'team',
          showEmail: true,
          showPhone: false
        },
        security: {
          twoFactor: false,
          sessionTimeout: 30
        }
      }
    })
  }, [profileState, settingsState])

  // Valider le profil
  const validateProfile = useCallback((data: Partial<UserProfile>) => {
    const errors: Record<string, string> = {}
    
    Object.entries(profileSchema).forEach(([field, validator]) => {
      const value = data[field as keyof UserProfile]
      if (value !== undefined) {
        const error = validator(String(value))
        if (error) {
          errors[field] = error
        }
      }
    })
    
    return errors
  }, [])

  // Sauvegarder le profil
  const handleSaveProfile = useCallback(async () => {
    const errors = validateProfile(profile)
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        validation.setError(field, message)
      })
      notifications.showError('Erreur de validation', 'Veuillez corriger les erreurs')
      return
    }

    try {
      await saveState.execute(async () => {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simuler une erreur aléatoire (10% de chance)
        if (Math.random() < 0.1) {
          throw new Error('Erreur de connexion au serveur')
        }
        
        return { success: true }
      })

      if (saveState.data) {
        notifications.showSuccess('Profil sauvegardé', 'Vos modifications ont été enregistrées')
        setIsEditing(false)
        validation.clearAllErrors()
      }
    } catch (error) {
      notifications.showError('Erreur de sauvegarde', error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }, [profile, validateProfile, saveState, validation, notifications])

  // Sauvegarder les paramètres
  const handleSaveSettings = useCallback(async () => {
    try {
      await saveState.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Sauvegarder le thème dans localStorage
        localStorage.setItem('sogara-theme', settings.theme)
        
        // Simuler une erreur aléatoire (5% de chance)
        if (Math.random() < 0.05) {
          throw new Error('Erreur de connexion au serveur')
        }
        
        return { success: true }
      })

      if (saveState.data) {
        notifications.showSuccess('Paramètres sauvegardés', 'Vos préférences ont été mises à jour')
      }
    } catch (error) {
      notifications.showError('Erreur de sauvegarde', error instanceof Error ? error.message : 'Impossible de sauvegarder les paramètres')
    }
  }, [saveState, notifications, settings.theme])

  // Gérer le changement de champ
  const handleFieldChange = useCallback((field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    validation.clearError(field)
  }, [validation])

  // Gérer le changement de paramètres
  const handleSettingChange = useCallback((path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: any = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      return newSettings
    })
  }, [])

  // Appliquer le thème (clair/sombre)
  const applyTheme = useCallback(() => {
    const root = document.documentElement
    
    if (settings.theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (settings.theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // Mode automatique basé sur les préférences système
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [settings.theme])

  // Appliquer le thème au changement
  useEffect(() => {
    applyTheme()
  }, [applyTheme])

  // Écouter les changements de préférences système en mode automatique
  useEffect(() => {
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleSystemThemeChange = () => {
        applyTheme()
      }
      
      mediaQuery.addEventListener('change', handleSystemThemeChange)
      
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
    }
  }, [settings.theme, applyTheme])

  // Gérer le changement de thème avec application immédiate
  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'auto') => {
    handleSettingChange('theme', theme)
    
    // Appliquer immédiatement le thème
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // Mode automatique basé sur les préférences système
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
    
    // Sauvegarder le thème dans localStorage
    localStorage.setItem('sogara-theme', theme)
    
    // Notification de succès
    notifications.showSuccess('Thème appliqué', `Thème ${theme === 'auto' ? 'automatique' : theme} activé`)
  }, [handleSettingChange, notifications])

  // Exporter les données utilisateur
  const handleExportData = useCallback(async () => {
    try {
      await saveState.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Créer un fichier JSON avec les données
        const exportData = {
          profile,
          settings,
          exportDate: new Date().toISOString(),
          version: '1.0'
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `sogara-user-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        return { success: true }
      })

      if (saveState.data) {
        notifications.showSuccess('Export réussi', 'Vos données ont été téléchargées')
      }
    } catch (error) {
      notifications.showError('Erreur d\'export', error instanceof Error ? error.message : 'Impossible d\'exporter les données')
    }
  }, [profile, settings, saveState, notifications])

  // Changer le mot de passe
  const handleChangePassword = useCallback(async () => {
    const currentPassword = prompt('Mot de passe actuel:')
    if (!currentPassword) return
    
    const newPassword = prompt('Nouveau mot de passe (min 8 caractères):')
    if (!newPassword) return
    
    const confirmPassword = prompt('Confirmer le nouveau mot de passe:')
    if (!confirmPassword) return
    
    // Validation du mot de passe
    if (newPassword.length < 8) {
      notifications.showError('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    if (newPassword !== confirmPassword) {
      notifications.showError('Mots de passe différents', 'Les mots de passe ne correspondent pas')
      return
    }
    
    if (newPassword === currentPassword) {
      notifications.showError('Mot de passe identique', 'Le nouveau mot de passe doit être différent de l\'actuel')
      return
    }

    try {
      await saveState.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simuler une erreur aléatoire (5% de chance)
        if (Math.random() < 0.05) {
          throw new Error('Erreur de connexion au serveur')
        }
        
        return { success: true }
      })

      if (saveState.data) {
        notifications.showSuccess('Mot de passe changé', 'Votre mot de passe a été mis à jour avec succès')
      }
    } catch (error) {
      notifications.showError('Erreur de changement', error instanceof Error ? error.message : 'Impossible de changer le mot de passe')
    }
  }, [saveState, notifications])

  // Télécharger les données de sécurité
  const handleDownloadSecurityData = useCallback(async () => {
    try {
      await saveState.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const securityData = {
          twoFactorEnabled: settings.security.twoFactor,
          sessionTimeout: settings.security.sessionTimeout,
          lastPasswordChange: new Date().toISOString(),
          securitySettings: settings.security
        }
        
        const blob = new Blob([JSON.stringify(securityData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `sogara-security-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        return { success: true }
      })

      if (saveState.data) {
        notifications.showSuccess('Données téléchargées', 'Vos données de sécurité ont été téléchargées')
      }
    } catch (error) {
      notifications.showError('Erreur de téléchargement', error instanceof Error ? error.message : 'Impossible de télécharger les données')
    }
  }, [settings.security, saveState, notifications])

  // Valider la finalisation complète
  const handleValidateFinalization = useCallback(async () => {
    try {
      await saveState.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Vérifier que tous les champs requis sont remplis
        const requiredFields = ['firstName', 'lastName', 'email', 'department']
        const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile])
        
        if (missingFields.length > 0) {
          throw new Error(`Champs manquants: ${missingFields.join(', ')}`)
        }
        
        return { success: true, completedFields: requiredFields.length }
      })

      if (saveState.data) {
        notifications.showSuccess('Finalisation validée', 'Votre espace utilisateur est maintenant complet et opérationnel')
      }
    } catch (error) {
      notifications.showError('Validation échouée', error instanceof Error ? error.message : 'Impossible de valider la finalisation')
    }
  }, [profile, saveState, notifications])

  // Statistiques de finalisation
  const finalizationStats = useMemo(() => {
    const totalChecks = 12
    const completedChecks = [
      profileState.data ? 1 : 0,
      settingsState.data ? 1 : 0,
      validation.isValid ? 1 : 0,
      !profileState.loading ? 1 : 0,
      !settingsState.loading ? 1 : 0,
      !saveState.loading ? 1 : 0,
      profile.firstName ? 1 : 0,
      profile.lastName ? 1 : 0,
      profile.email ? 1 : 0,
      profile.department ? 1 : 0,
      settings.theme ? 1 : 0,
      notifications.notifications.length >= 0 ? 1 : 0
    ].reduce((sum, check) => sum + check, 0)

    return {
      completed: completedChecks,
      total: totalChecks,
      percentage: Math.round((completedChecks / totalChecks) * 100)
    }
  }, [profileState, settingsState, validation, saveState, profile, settings, notifications])

  return (
    <ResponsiveContainer maxWidth="2xl" padding="lg">
      <div className="space-y-6">
        {/* En-tête avec notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finalisation Espace Utilisateur</h1>
            <p className="text-muted-foreground">
              Configuration complète de votre profil et paramètres
            </p>
          </div>
          <NotificationCenter
            notifications={notifications.notifications}
            onMarkAsRead={notifications.markAsRead}
            onRemove={notifications.removeNotification}
            onMarkAllAsRead={notifications.markAllAsRead}
            onClearAll={notifications.clearAll}
          />
        </div>

        {/* Statistiques de finalisation */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Progression de la finalisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Complétion globale</span>
                <span className="font-semibold">{finalizationStats.percentage}%</span>
              </div>
              <Progress value={finalizationStats.percentage} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {finalizationStats.completed} / {finalizationStats.total} éléments finalisés
              </div>
              {finalizationStats.percentage === 100 && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalisation complète ! Votre espace utilisateur est prêt.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-4">
            <LoadingOverlay isLoading={profileState.loading} text="Chargement du profil...">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profil Utilisateur
                    </CardTitle>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={saveState.loading}
                          >
                            Annuler
                          </Button>
                          <ActionButton
                            onClick={handleSaveProfile}
                            loading={saveState.loading}
                            success={!!saveState.data}
                            loadingText="Sauvegarde..."
                            successText="Sauvegardé !"
                            icon={<Save className="w-4 h-4" />}
                          >
                            Sauvegarder
                          </ActionButton>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="md">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Entrez votre prénom"
                      />
                      <FormError error={validation.errors.firstName} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Entrez votre nom"
                      />
                      <FormError error={validation.errors.lastName} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        disabled={!isEditing}
                        placeholder="votre.email@sogara.com"
                      />
                      <FormError error={validation.errors.email} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="+33 1 23 45 67 89"
                      />
                      <FormError error={validation.errors.phone} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleFieldChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Décrivez votre rôle et vos responsabilités..."
                        rows={3}
                      />
                      <FormError error={validation.errors.bio} />
                      <div className="text-xs text-muted-foreground">
                        {profile.bio.length} / 500 caractères
                      </div>
                    </div>
                  </ResponsiveGrid>
                </CardContent>
              </Card>
            </LoadingOverlay>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="space-y-4">
            <LoadingOverlay isLoading={settingsState.loading} text="Chargement des paramètres...">
              <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
                {/* Thème et apparence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Apparence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                       <Label>Thème</Label>
                       <div className="grid grid-cols-3 gap-2">
                         {(['light', 'dark', 'auto'] as const).map((theme) => (
                           <Button
                             key={theme}
                             variant={settings.theme === theme ? 'default' : 'outline'}
                             onClick={() => handleThemeChange(theme)}
                             className="capitalize"
                           >
                             {theme === 'auto' ? 'Automatique' : theme === 'light' ? 'Clair' : 'Sombre'}
                           </Button>
                         ))}
                       </div>
                       <div className="text-xs text-muted-foreground">
                         Le thème {settings.theme === 'auto' ? 'automatique' : settings.theme === 'light' ? 'clair' : 'sombre'} est actuellement actif
                       </div>
                     </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email</Label>
                        <Button
                          variant={settings.notifications.email ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSettingChange('notifications.email', !settings.notifications.email)}
                        >
                          {settings.notifications.email ? 'Activé' : 'Désactivé'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push</Label>
                        <Button
                          variant={settings.notifications.push ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSettingChange('notifications.push', !settings.notifications.push)}
                        >
                          {settings.notifications.push ? 'Activé' : 'Désactivé'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">SMS</Label>
                        <Button
                          variant={settings.notifications.sms ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSettingChange('notifications.sms', !settings.notifications.sms)}
                        >
                          {settings.notifications.sms ? 'Activé' : 'Désactivé'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Confidentialité */}
                <Card>
                  <CardHeader>
                    <CardTitle>Confidentialité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Visibilité du profil</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['public', 'private', 'team'] as const).map((visibility) => (
                          <Button
                            key={visibility}
                            variant={settings.privacy.profileVisibility === visibility ? 'default' : 'outline'}
                            onClick={() => handleSettingChange('privacy.profileVisibility', visibility)}
                            className="capitalize"
                          >
                            {visibility === 'team' ? 'Équipe' : visibility}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ActionButton
                      onClick={handleSaveSettings}
                      loading={saveState.loading}
                      success={!!saveState.data}
                      loadingText="Sauvegarde..."
                      successText="Sauvegardé !"
                      icon={<Save className="w-4 h-4" />}
                      className="w-full"
                    >
                      Sauvegarder les paramètres
                    </ActionButton>
                    
                    <ActionButton
                      onClick={handleExportData}
                      loading={saveState.loading}
                      success={!!saveState.data}
                      loadingText="Export en cours..."
                      successText="Exporté !"
                      icon={<Download className="w-4 h-4" />}
                      className="w-full"
                    >
                      Exporter les données
                    </ActionButton>
                  </CardContent>
                </Card>
              </ResponsiveGrid>
            </LoadingOverlay>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Authentification à deux facteurs</h3>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                      {settings.security.twoFactor && (
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Sécurité renforcée activée</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant={settings.security.twoFactor ? 'default' : 'outline'}
                      onClick={() => handleSettingChange('security.twoFactor', !settings.security.twoFactor)}
                    >
                      {settings.security.twoFactor ? 'Activé' : 'Activer'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Délai de session (minutes)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (value >= 5 && value <= 480) {
                            handleSettingChange('security.sessionTimeout', value)
                          }
                        }}
                        className="w-20"
                        min="5"
                        max="480"
                        placeholder="30"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recommandé: 30-60 minutes pour la sécurité
                    </div>
                    {settings.security.sessionTimeout < 30 && (
                      <div className="flex items-center gap-1 text-orange-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Session courte - considérez augmenter pour plus de sécurité</span>
                      </div>
                    )}
                    {settings.security.sessionTimeout > 120 && (
                      <div className="flex items-center gap-1 text-blue-600 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Session longue - pratique mais moins sécurisée</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <ActionButton
                      onClick={handleChangePassword}
                      loading={saveState.loading}
                      success={!!saveState.data}
                      loadingText="Changement..."
                      successText="Changé !"
                      icon={<RefreshCw className="w-4 h-4" />}
                      variant="outline"
                    >
                      Changer le mot de passe
                    </ActionButton>
                    <ActionButton
                      onClick={handleDownloadSecurityData}
                      loading={saveState.loading}
                      success={!!saveState.data}
                      loadingText="Téléchargement..."
                      successText="Téléchargé !"
                      icon={<Download className="w-4 h-4" />}
                      variant="outline"
                    >
                      Télécharger les données
                    </ActionButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Validation */}
          <TabsContent value="validation" className="space-y-4">
            <PatternValidation />
          </TabsContent>
        </Tabs>

        {/* Actions globales */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Finalisation complète</h3>
                <p className="text-sm text-blue-700">
                  Votre espace utilisateur est configuré et prêt à l'emploi
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadUserData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
                <ActionButton
                  onClick={handleValidateFinalization}
                  loading={saveState.loading}
                  success={!!saveState.data}
                  loadingText="Validation..."
                  successText="Validé !"
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Valider la finalisation
                </ActionButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  )
}
