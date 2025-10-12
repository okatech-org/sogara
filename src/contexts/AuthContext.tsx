import React, { createContext, useContext, useEffect, useReducer, ReactNode, useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Employee } from '@/types';
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
  const [matricule, setMatricule] = useState<string | null>(null);

  // Query Convex pour authentification
  const employeeData = useQuery(
    api.auth.login,
    matricule ? { matricule } : "skip"
  );

  // Quand les données employé arrivent de Convex
  useEffect(() => {
    if (employeeData) {
      const employee: Employee = {
        id: employeeData._id,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        matricule: employeeData.matricule,
        service: employeeData.service,
        roles: employeeData.roles,
        competences: employeeData.competences,
        habilitations: employeeData.habilitations,
        email: employeeData.email,
        phone: employeeData.phone,
        status: employeeData.status,
        stats: employeeData.stats,
        equipmentIds: employeeData.equipmentIds || [],
        createdAt: new Date(employeeData._creationTime),
        updatedAt: new Date(employeeData._creationTime),
      };

      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('userId', employee.id);
      localStorage.setItem('matricule', employee.matricule);

      dispatch({ type: 'AUTH_SUCCESS', payload: employee });
      
      console.info('✅ Authentification réussie via Convex');
    } else if (employeeData === null && matricule) {
      // L'employé n'existe pas
      dispatch({ type: 'AUTH_FAILURE', payload: 'Matricule non trouvé' });
      setMatricule(null);
    }
  }, [employeeData, matricule]);

  // Initialiser l'authentification au démarrage
  useEffect(() => {
    const storedMatricule = localStorage.getItem('matricule');
    if (storedMatricule) {
      setMatricule(storedMatricule);
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fonction de connexion
  const login = async (inputMatricule: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Déclencher la query Convex
      setMatricule(inputMatricule.toUpperCase());

      // La query s'exécute automatiquement via useEffect
      // On retourne success immédiatement
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
      // Nettoyer le localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('matricule');
      
      // Réinitialiser le matricule (arrête la query Convex)
      setMatricule(null);
      
      dispatch({ type: 'AUTH_LOGOUT' });
      
      toast({
        title: 'Déconnexion',
        description: 'Vous avez été déconnecté avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  };

  // Rafraîchir l'authentification
  const refreshAuth = async (): Promise<void> => {
    // Avec Convex, les données sont automatiquement mises à jour en temps réel
    // Pas besoin de refresh manuel
    console.info('✅ Convex gère automatiquement le refresh');
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
