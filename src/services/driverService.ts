import { BaseApiService, apiClient } from '@/lib/api';

// Types pour les chauffeurs
export interface DriverProfile {
  id: string;
  balance: number;
  accountBanned: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    activated: boolean;
  };
  vehicles?: Vehicle[];
  availabilities?: Availability[];
  ratings?: number;
  totalTrips?: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: 'SEDAN' | 'SUV' | 'WAGON' | 'MOTORCYCLE';
  vehicleStatus: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  hasLuggage: boolean;
  owner?: Owner;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface Availability {
  id: string;
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface DriverCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  balance?: number;
}

export interface DriverUpdateRequest {
  balance?: number;
  accountBanned?: boolean;
}

// Service pour la gestion des chauffeurs
export class DriverService extends BaseApiService<DriverProfile> {
  constructor() {
    super('/driver-profiles');
  }

  // Bannir/débannir un chauffeur
  async toggleBanStatus(driverId: string, banned: boolean): Promise<DriverProfile> {
    return this.update(driverId, { accountBanned: banned });
  }

  // Mettre à jour le solde d'un chauffeur
  async updateBalance(driverId: string, balance: number): Promise<DriverProfile> {
    return this.update(driverId, { balance });
  }

  // Obtenir les véhicules d'un chauffeur
  async getDriverVehicles(driverId: string): Promise<Vehicle[]> {
    const response = await apiClient.get(`/driver-profiles/${driverId}/vehicles`);
    return response.data;
  }

  // Obtenir les disponibilités d'un chauffeur
  async getDriverAvailabilities(driverId: string): Promise<Availability[]> {
    const response = await apiClient.get(`/driver-profiles/${driverId}/availabilities`);
    return response.data;
  }

  // Obtenir les statistiques d'un chauffeur
  async getDriverStats(driverId: string): Promise<any> {
    const response = await apiClient.get(`/driver-profiles/${driverId}/stats`);
    return response.data;
  }

  // Rechercher des chauffeurs avec filtres avancés
  async searchDriversAdvanced(filters: {
    name?: string;
    phoneNumber?: string;
    vehicleType?: string;
    status?: string;
    hasLuggage?: boolean;
    accountBanned?: boolean;
  }): Promise<DriverProfile[]> {
    const response = await apiClient.get('/driver-profiles', {
      params: filters
    });
    return response.data;
  }
}

export const driverService = new DriverService();