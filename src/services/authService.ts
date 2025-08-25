import { apiClient } from '@/lib/api';

// Types pour l'authentification
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    authorities: string[];
  };
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  adminProfile: {
    id: string;
    balance: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      authorities: string[];
    };
  };
}

export interface SupportLoginRequest {
  username: string;
  password: string;
}

export interface SupportLoginResponse {
  accessToken: string;
  refreshToken: string;
  supportProfile: {
    id: string;
    specialization: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      authorities: string[];
    };
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface OtpRequest {
  phoneNumber: string;
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  otpCode: string;
}

// Service d'authentification
export class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  // Connexion utilisateur standard
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/authenticate', credentials);
    const { accessToken, user } = response.data;
    
    this.setToken(accessToken);
    this.setUser(user);
    
    return response.data;
  }

  // Connexion admin
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await apiClient.post('/backoffice/auth/admin/login', credentials);
    const { accessToken, adminProfile } = response.data;
    
    this.setToken(accessToken);
    this.setUser(adminProfile.user);
    
    return response.data;
  }

  // Connexion support
  async supportLogin(credentials: SupportLoginRequest): Promise<SupportLoginResponse> {
    const response = await apiClient.post('/backoffice/auth/support/login', credentials);
    const { accessToken, supportProfile } = response.data;
    
    this.setToken(accessToken);
    this.setUser(supportProfile.user);
    
    return response.data;
  }

  // Inscription
  async register(userData: RegisterRequest): Promise<void> {
    await apiClient.post('/register', userData);
  }

  // Envoyer code OTP
  async sendOtp(request: OtpRequest): Promise<void> {
    await apiClient.post('/auth/otp/send', request);
  }

  // Vérifier code OTP
  async verifyOtp(request: OtpVerifyRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/otp/verify', request);
    const { accessToken, user } = response.data;
    
    this.setToken(accessToken);
    this.setUser(user);
    
    return response.data;
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Obtenir le token actuel
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.authorities?.includes(role) || false;
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  // Vérifier si l'utilisateur est support
  isSupport(): boolean {
    return this.hasRole('ROLE_BACKOFFICE');
  }

  // Obtenir le profil utilisateur actuel
  async getCurrentProfile(): Promise<any> {
    const response = await apiClient.get('/account');
    return response.data;
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(profileData: any): Promise<any> {
    const response = await apiClient.post('/account', profileData);
    return response.data;
  }

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/account/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Méthodes privées
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();