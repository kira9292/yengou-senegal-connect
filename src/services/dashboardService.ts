import { apiClient } from '@/lib/api';

// Types pour les statistiques du dashboard
export interface SystemStats {
  totalDrivers: number;
  totalClients: number;
  totalServices: number;
  servicesToday: number;
  revenueToday: number;
  lastUpdated: string;
}

export interface DriverStats {
  totalDrivers: number;
  activeDrivers: number;
  bannedDrivers: number;
  driversWithLuggage: number;
}

export interface ClientStats {
  totalClients: number;
  clientsUsingTravel: number;
  clientsUsingExpress: number;
  clientsUsingPackage: number;
}

export interface ServiceStats {
  totalServices: number;
  travelServices: number;
  expressServices: number;
  packageServices: number;
  pendingServices: number;
  activeServices: number;
  completedServices: number;
  cancelledServices: number;
}

export interface RecentService {
  id: string;
  serviceType: 'TRAVEL' | 'EXPRESS' | 'PACKAGE';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  requestDate: string;
  departureLocationName: string;
  arrivalLocationName: string;
}

export interface RecentDriver {
  id: string;
  balance: number;
  hasLuggage: boolean;
  accountBanned: boolean;
  userFirstName?: string;
  userLastName?: string;
  userPhoneNumber?: string;
}

export interface SystemAlert {
  type: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Service Dashboard
export class DashboardService {
  private baseUrl = '/backoffice/dashboard';

  // Statistiques générales
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Statistiques des chauffeurs
  async getDriverStats(): Promise<DriverStats> {
    const response = await apiClient.get(`${this.baseUrl}/drivers/stats`);
    return response.data;
  }

  // Statistiques des clients
  async getClientStats(): Promise<ClientStats> {
    const response = await apiClient.get(`${this.baseUrl}/clients/stats`);
    return response.data;
  }

  // Statistiques des services
  async getServiceStats(): Promise<ServiceStats> {
    const response = await apiClient.get(`${this.baseUrl}/services/stats`);
    return response.data;
  }

  // Services récents
  async getRecentServices(): Promise<RecentService[]> {
    const response = await apiClient.get(`${this.baseUrl}/services/recent`);
    return response.data;
  }

  // Chauffeurs récents
  async getRecentDrivers(): Promise<RecentDriver[]> {
    const response = await apiClient.get(`${this.baseUrl}/drivers/recent`);
    return response.data;
  }

  // Alertes système (ADMIN uniquement)
  async getSystemAlerts(): Promise<SystemAlert[]> {
    const response = await apiClient.get(`${this.baseUrl}/alerts`);
    return response.data;
  }
}

export const dashboardService = new DashboardService();