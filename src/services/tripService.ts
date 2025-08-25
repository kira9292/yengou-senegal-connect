import { BaseApiService } from '@/lib/api';

// Types pour les courses et services
export interface Trip {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime?: string;
  estimatedEndTime?: string;
  distance: number;
  duration: number;
  price: number;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  service: ServiceEntity;
  rating?: TripRating;
}

export interface ServiceEntity {
  id: string;
  serviceType: 'TRAVEL' | 'EXPRESS' | 'PACKAGE';
  status: 'PENDING' | 'MATCHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  requestDate: string;
  desiredTime: string;
  departureLatitude: number;
  departureLongitude: number;
  departureLocationName: string;
  arrivalLatitude: number;
  arrivalLongitude: number;
  arrivalLocationName: string;
  passengerCount?: number;
  hasLuggage?: boolean;
  packageDescription?: string;
  packageWeight?: number;
  price: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export interface TripRating {
  id: string;
  rating: number;
  comment?: string;
  ratedAt: string;
}

export interface LocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: string;
}

// Service pour la gestion des courses
export class TripService extends BaseApiService<Trip> {
  constructor() {
    super('/trips');
  }

  // Obtenir les courses actives
  async getActiveTrips(): Promise<Trip[]> {
    const response = await this.apiClient.get('/trips', {
      params: { 'status.in': ['ACCEPTED', 'IN_TRANSIT'] }
    });
    return response.data;
  }

  // Obtenir les courses par statut
  async getTripsByStatus(status: string): Promise<Trip[]> {
    const response = await this.apiClient.get('/trips', {
      params: { 'status.equals': status }
    });
    return response.data;
  }

  // Mettre à jour le statut d'une course
  async updateTripStatus(tripId: string, status: string): Promise<Trip> {
    const response = await this.apiClient.put(`/trips/${tripId}/status`, { status });
    return response.data;
  }

  // Annuler une course
  async cancelTrip(tripId: string, reason?: string): Promise<Trip> {
    const response = await this.apiClient.put(`/trips/${tripId}/cancel`, { reason });
    return response.data;
  }

  // Obtenir l'historique des courses d'un chauffeur
  async getDriverTripHistory(driverId: string, page = 0, size = 20): Promise<any> {
    const response = await this.apiClient.get('/trips', {
      params: {
        'driverId.equals': driverId,
        page,
        size,
        sort: 'startTime,desc'
      }
    });
    return response.data;
  }

  // Obtenir l'historique des courses d'un client
  async getClientTripHistory(clientId: string, page = 0, size = 20): Promise<any> {
    const response = await this.apiClient.get('/trips', {
      params: {
        'clientId.equals': clientId,
        page,
        size,
        sort: 'startTime,desc'
      }
    });
    return response.data;
  }

  // Recherche avancée de courses
  async searchTrips(filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    driverId?: string;
    clientId?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Trip[]> {
    const response = await this.apiClient.get('/trips', { params: filters });
    return response.data;
  }
}

// Service pour les entités de service (demandes de courses)
export class ServiceEntityService extends BaseApiService<ServiceEntity> {
  constructor() {
    super('/service-entities');
  }

  // Obtenir les services en attente
  async getPendingServices(): Promise<ServiceEntity[]> {
    const response = await this.apiClient.get('/service-entities', {
      params: { 'status.equals': 'PENDING' }
    });
    return response.data;
  }

  // Obtenir les services par type
  async getServicesByType(serviceType: string): Promise<ServiceEntity[]> {
    const response = await this.apiClient.get('/service-entities', {
      params: { 'serviceType.equals': serviceType }
    });
    return response.data;
  }

  // Assigner un service à un chauffeur
  async assignServiceToDriver(serviceId: string, driverId: string): Promise<ServiceEntity> {
    const response = await this.apiClient.post(`/service-entities/${serviceId}/assign`, {
      driverId
    });
    return response.data;
  }

  // Calculer le prix d'un service
  async calculateServicePrice(serviceRequest: {
    serviceType: string;
    departureLatitude: number;
    departureLongitude: number;
    arrivalLatitude: number;
    arrivalLongitude: number;
    passengerCount?: number;
    hasLuggage?: boolean;
  }): Promise<{ price: number; distance: number; duration: number }> {
    const response = await this.apiClient.post('/service-entities/calculate-price', serviceRequest);
    return response.data;
  }
}

export const tripService = new TripService();
export const serviceEntityService = new ServiceEntityService();