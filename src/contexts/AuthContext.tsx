import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Employee } from '@/types';
import { authAPI, apiService } from '@/services/api.service';
import { repositories } from '@/services/repositories';
import { toast } from '@/hooks/use-toast';

// Types pour le contexte d'authentification
interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: Employee }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (matricule: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

// État initial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isOnline: true
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Contexte
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier la connectivité au démarrage
  useEffect(() => {
    checkConnectivity();
    initializeAuth();

    // Écouter les événements de déconnexion automatique
    const handleAutoLogout = (event: CustomEvent) => {
      console.warn('Déconnexion automatique:', event.detail);
      handleLogout();
    };

    window.addEventListener('auth:logout' as any, handleAutoLogout);

    return () => {
      window.removeEventListener('auth:logout' as any, handleAutoLogout);
    };
  }, []);

  // Vérifier la connectivité réseau
  const checkConnectivity = async () => {
    try {
      const stats = await apiService.getApiStats();
      dispatch({ type: 'SET_ONLINE_STATUS', payload: stats.connected });
      
      if (stats.connected) {
        console.info(`✅ API connectée (${stats.responseTime}ms)`);
      } else {
        console.warn('⚠️ API non disponible, mode hors-ligne activé');
      }
    } catch (error) {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      console.warn('⚠️ Vérification connectivité échouée:', error);
    }
  };

  // Initialiser l'authentification au démarrage
  const initializeAuth = async () => {
    dispatch({ type: 'AUTH_START' });

    try {
      const storedToken = localStorage.getItem('accessToken');
      
      if (!storedToken) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Aucun token trouvé' });
        return;
      }

      // Configurer le token dans le service API
      apiService.setToken(storedToken);

      // Vérifier la validité du token via l'API
      if (state.isOnline) {
        const response = await authAPI.validateToken();
        
        if (response.success && response.data?.user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
          console.info('✅ Authentification restaurée depuis l\'API');
          return;
        }
      }

      // Fallback : chercher dans les données locales
      const employees = repositories.employees.getAll();
      const storedUserId = localStorage.getItem('userId');
      const user = employees.find(emp => emp.id === storedUserId);

      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        console.info('✅ Authentification restaurée depuis les données locales');
      } else {
        throw new Error('Utilisateur non trouvé');
      }

    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
      
      // Nettoyer le stockage en cas d'erreur
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      apiService.setToken(null);
      
      dispatch({ type: 'AUTH_FAILURE', payload: 'Session expirée' });
    }
  };

  // Fonction de connexion
  const login = async (matricule: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Tentative de connexion via API si en ligne
      if (state.isOnline && password) {
        try {
          const response = await authAPI.login(matricule, password);
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            // Stocker les tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('userId', user.id);
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
            }
            
            // Configurer le service API
            apiService.setToken(accessToken);
            
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
            
            toast({
              title: 'Connexion réussie',
              description: `Bienvenue ${user.firstName} ${user.lastName}`
            });
            
            return { success: true };
          }
        } catch (error) {
          console.warn('⚠️ Connexion API échouée, tentative locale:', error);
        }
      }

      // Fallback : connexion locale (pour démonstration)
      const employees = repositories.employees.getAll();
      const employee = employees.find(emp => 
        emp.matricule.toLowerCase() === matricule.toLowerCase()
      );

      if (!employee) {
        const errorMessage = 'Matricule non trouvé';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        return { success: false, error: errorMessage };
      }

      // Stocker l'ID utilisateur
      localStorage.setItem('userId', employee.id);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: employee });
      
      toast({
        title: state.isOnline ? 'Connexion (démo locale)' : 'Connexion hors-ligne',
        description: `Bienvenue ${employee.firstName} ${employee.lastName}`
      });
      
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      // Tentative de déconnexion via API si en ligne et authentifié
      if (state.isOnline && state.isAuthenticated) {
        try {
          await authAPI.logout();
        } catch (error) {
          console.warn('⚠️ Erreur déconnexion API (continuons tout de même):', error);
        }
      }

      handleLogout();
      
      toast({
        title: 'Déconnexion',
        description: 'Vous avez été déconnecté avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      handleLogout();
    }
  };

  // Gérer la déconnexion (nettoyage)
  const handleLogout = (): void => {
    // Nettoyer le stockage local
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    
    // Réinitialiser le service API
    apiService.setToken(null);
    
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Rafraîchir l'authentification
  const refreshAuth = async (): Promise<void> => {
    if (!state.isOnline || !state.isAuthenticated) {
      return;
    }

    try {
      const response = await authAPI.getProfile();
      
      if (response.success && response.data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      }
    } catch (error) {
      console.error('❌ Erreur rafraîchissement profil:', error);
    }
  };

  // Nettoyer l'erreur
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAuth,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  
  return context;
};
