import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { realtimeService } from '@/services/realtimeService';

// Types pour l'authentification
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  authorities: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  adminLogin: (credentials: any) => Promise<void>;
  supportLogin: (credentials: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupport: boolean;
  hasRole: (role: string) => boolean;
}

// Contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider d'authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialisation au chargement
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = authService.getToken();
        const savedUser = authService.getCurrentUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          
          // Connecter au WebSocket avec le token
          realtimeService.connect(savedToken);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        // Nettoyer les données corrompues
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connexion utilisateur standard
  const login = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setToken(response.accessToken);
      
      // Connecter au WebSocket
      realtimeService.connect(response.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion admin
  const adminLogin = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authService.adminLogin(credentials);
      
      setUser(response.adminProfile.user);
      setToken(response.accessToken);
      
      // Connecter au WebSocket avec privilèges admin
      realtimeService.connect(response.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion support
  const supportLogin = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authService.supportLogin(credentials);
      
      setUser(response.supportProfile.user);
      setToken(response.accessToken);
      
      // Connecter au WebSocket avec privilèges support
      realtimeService.connect(response.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    
    // Déconnecter du WebSocket
    realtimeService.disconnect();
  };

  // Vérifications des rôles
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.authorities?.includes('ROLE_ADMIN') || false;
  const isSupport = user?.authorities?.includes('ROLE_BACKOFFICE') || false;

  const hasRole = (role: string) => {
    return user?.authorities?.includes(role) || false;
  };

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    adminLogin,
    supportLogin,
    logout,
    isAuthenticated,
    isAdmin,
    isSupport,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser l'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook pour protéger les routes
export const useRequireAuth = (requiredRole?: string) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return { authorized: false, loading: true };
  }

  if (!isAuthenticated) {
    return { authorized: false, loading: false, reason: 'not_authenticated' };
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return { authorized: false, loading: false, reason: 'insufficient_permissions' };
  }

  return { authorized: true, loading: false };
};

// Hook pour l'auto-refresh du token
export const useTokenRefresh = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Décoder le JWT pour obtenir l'expiration (simple, sans lib externe)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir en ms
      const now = Date.now();
      const timeUntilExpiry = exp - now;

      // Si le token expire dans moins de 5 minutes, déclencher un refresh
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        // Ici on pourrait implémenter un refresh automatique
        // Pour l'instant, on déconnecte l'utilisateur
        setTimeout(() => {
          console.log('Token expiré, déconnexion automatique');
          logout();
        }, timeUntilExpiry);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du token:', error);
    }
  }, [token, logout]);
};