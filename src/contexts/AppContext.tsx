import { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  Employee, 
  Visitor, 
  Visit, 
  PackageMail, 
  Equipment, 
  Notification, 
  DashboardStats,
  UserRole,
  Post,
  HSEIncident,
  HSETraining
} from '@/types';
import { repositories } from '@/services/repositories';

interface AppState {
  currentUser: Employee | null;
  employees: Employee[];
  visitors: Visitor[];
  visits: Visit[];
  packages: PackageMail[];
  equipment: Equipment[];
  hseIncidents: HSEIncident[];
  hseTrainings: HSETraining[];
  notifications: Notification[];
  dashboardStats: DashboardStats;
  posts: Post[];
  loading: boolean;
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: Employee | null }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'SET_VISITORS'; payload: Visitor[] }
  | { type: 'ADD_VISITOR'; payload: Visitor }
  | { type: 'SET_VISITS'; payload: Visit[] }
  | { type: 'ADD_VISIT'; payload: Visit }
  | { type: 'UPDATE_VISIT'; payload: Visit }
  | { type: 'SET_PACKAGES'; payload: PackageMail[] }
  | { type: 'ADD_PACKAGE'; payload: PackageMail }
  | { type: 'UPDATE_PACKAGE'; payload: PackageMail }
  | { type: 'SET_EQUIPMENT'; payload: Equipment[] }
  | { type: 'ADD_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'SET_HSE_INCIDENTS'; payload: HSEIncident[] }
  | { type: 'ADD_HSE_INCIDENT'; payload: HSEIncident }
  | { type: 'UPDATE_HSE_INCIDENT'; payload: HSEIncident }
  | { type: 'DELETE_HSE_INCIDENT'; payload: string }
  | { type: 'SET_HSE_TRAININGS'; payload: HSETraining[] }
  | { type: 'ADD_HSE_TRAINING'; payload: HSETraining }
  | { type: 'UPDATE_HSE_TRAINING'; payload: HSETraining }
  | { type: 'DELETE_HSE_TRAINING'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  currentUser: null,
  employees: [],
  visitors: [],
  visits: [],
  packages: [],
  equipment: [],
  hseIncidents: [],
  hseTrainings: [],
  notifications: [],
  posts: [],
  dashboardStats: {
    visitsToday: { total: 0, waiting: 0, inProgress: 0, completed: 0 },
    packages: { pending: 0, urgent: 0, delivered: 0 },
    equipment: { needsCheck: 0, inMaintenance: 0, incidents: 0 },
    hse: { openIncidents: 0, trainingsThisWeek: 0, complianceRate: 0 },
  },
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id ? action.payload : emp
        ),
      };
    
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
      };
    
    case 'SET_VISITORS':
      return { ...state, visitors: action.payload };
    
    case 'ADD_VISITOR':
      return { ...state, visitors: [...state.visitors, action.payload] };
    
    case 'SET_VISITS':
      return { ...state, visits: action.payload };
    
    case 'ADD_VISIT':
      return { ...state, visits: [...state.visits, action.payload] };
    
    case 'UPDATE_VISIT':
      return {
        ...state,
        visits: state.visits.map(visit => 
          visit.id === action.payload.id ? action.payload : visit
        ),
      };
    
    case 'SET_PACKAGES':
      return { ...state, packages: action.payload };
    
    case 'ADD_PACKAGE':
      return { ...state, packages: [...state.packages, action.payload] };
    
    case 'UPDATE_PACKAGE':
      return {
        ...state,
        packages: state.packages.map(pkg => 
          pkg.id === action.payload.id ? action.payload : pkg
        ),
      };
    
    case 'SET_EQUIPMENT':
      return { ...state, equipment: action.payload };
    
    case 'ADD_EQUIPMENT':
      return { ...state, equipment: [...state.equipment, action.payload] };
    
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map(eq => 
          eq.id === action.payload.id ? action.payload : eq
        ),
      };
    
    case 'SET_HSE_INCIDENTS':
      return { ...state, hseIncidents: action.payload };
    
    case 'ADD_HSE_INCIDENT':
      return { ...state, hseIncidents: [...state.hseIncidents, action.payload] };
    
    case 'UPDATE_HSE_INCIDENT':
      return {
        ...state,
        hseIncidents: state.hseIncidents.map(incident => 
          incident.id === action.payload.id ? action.payload : incident
        ),
      };
    
    case 'DELETE_HSE_INCIDENT':
      return {
        ...state,
        hseIncidents: state.hseIncidents.filter(incident => incident.id !== action.payload),
      };
    
    case 'SET_HSE_TRAININGS':
      return { ...state, hseTrainings: action.payload };
    
    case 'ADD_HSE_TRAINING':
      return { ...state, hseTrainings: [...state.hseTrainings, action.payload] };
    
    case 'UPDATE_HSE_TRAINING':
      return {
        ...state,
        hseTrainings: state.hseTrainings.map(training => 
          training.id === action.payload.id ? action.payload : training
        ),
      };
    
    case 'DELETE_HSE_TRAINING':
      return {
        ...state,
        hseTrainings: state.hseTrainings.filter(training => training.id !== action.payload),
      };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    
    case 'UPDATE_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    
    case 'ADD_POST':
      return { ...state, posts: [...state.posts, action.payload] };
    
    case 'UPDATE_POST':
      return { 
        ...state, 
        posts: state.posts.map(post => 
          post.id === action.payload.id ? action.payload : post
        ) 
      };
    
    case 'DELETE_POST':
      return { ...state, posts: state.posts.filter(post => post.id !== action.payload) };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function useAuth() {
  const { state, dispatch } = useApp();

  const login = (employee: Employee) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: employee });
  };

  const logout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const hasRole = (role: UserRole): boolean => {
    return state.currentUser?.roles.includes(role) ?? false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  return {
    currentUser: state.currentUser,
    isAuthenticated: !!state.currentUser,
    login,
    logout,
    hasRole,
    hasAnyRole,
    state, // Ajout de state pour permettre l'accès aux données globales
  };
}