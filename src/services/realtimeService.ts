// Import conditionnel pour éviter les erreurs SSR
let io: any;
if (typeof window !== 'undefined') {
  io = require('socket.io-client').io;
}

type Socket = any;

// Types pour les événements temps réel
export interface DriverLocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}

export interface TripUpdate {
  tripId: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedArrival?: string;
  progress?: number;
}

export interface ServiceMatchUpdate {
  serviceId: string;
  status: 'MATCHING' | 'MATCHED' | 'FAILED';
  driverId?: string;
  estimatedPickupTime?: string;
}

export interface SystemNotification {
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: string;
  userId?: string;
  targetRole?: string[];
}

// Service temps réel avec WebSocket
export class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(private baseUrl = 'http://localhost:8080') {}

  // Connecter au WebSocket
  connect(token?: string): void {
    if (typeof window === 'undefined' || !io) {
      console.warn('WebSocket non disponible côté serveur');
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    const options: any = {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    };

    if (token) {
      options.auth = { token };
    }

    this.socket = io(this.baseUrl, options);

    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket déconnecté:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erreur WebSocket:', error);
      this.emit('error', error);
    });

    // Événements métier
    this.setupBusinessListeners();
  }

  // Déconnecter du WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Configurer les listeners d'événements métier
  private setupBusinessListeners(): void {
    if (!this.socket) return;

    // Mise à jour position chauffeur
    this.socket.on('driver:location:update', (data: DriverLocationUpdate) => {
      this.emit('driverLocationUpdate', data);
    });

    // Mise à jour course
    this.socket.on('trip:update', (data: TripUpdate) => {
      this.emit('tripUpdate', data);
    });

    // Mise à jour matching service
    this.socket.on('service:match:update', (data: ServiceMatchUpdate) => {
      this.emit('serviceMatchUpdate', data);
    });

    // Notifications système
    this.socket.on('system:notification', (data: SystemNotification) => {
      this.emit('systemNotification', data);
    });

    // Événements dashboard
    this.socket.on('dashboard:stats:update', (data: any) => {
      this.emit('dashboardStatsUpdate', data);
    });

    // Événements alertes
    this.socket.on('system:alert', (data: any) => {
      this.emit('systemAlert', data);
    });
  }

  // S'abonner aux mises à jour d'un chauffeur spécifique
  subscribeToDriver(driverId: string): void {
    if (this.socket) {
      this.socket.emit('subscribe:driver', { driverId });
    }
  }

  // Se désabonner des mises à jour d'un chauffeur
  unsubscribeFromDriver(driverId: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe:driver', { driverId });
    }
  }

  // S'abonner aux mises à jour d'une course
  subscribeToTrip(tripId: string): void {
    if (this.socket) {
      this.socket.emit('subscribe:trip', { tripId });
    }
  }

  // Se désabonner des mises à jour d'une course
  unsubscribeFromTrip(tripId: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe:trip', { tripId });
    }
  }

  // S'abonner aux statistiques du dashboard
  subscribeToDashboard(): void {
    if (this.socket) {
      this.socket.emit('subscribe:dashboard');
    }
  }

  // Se désabonner des statistiques du dashboard
  unsubscribeFromDashboard(): void {
    if (this.socket) {
      this.socket.emit('unsubscribe:dashboard');
    }
  }

  // Envoyer une mise à jour de position (pour les chauffeurs)
  sendLocationUpdate(locationData: Omit<DriverLocationUpdate, 'timestamp'>): void {
    if (this.socket) {
      this.socket.emit('driver:location:send', {
        ...locationData,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Écouter un événement
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Arrêter d'écouter un événement
  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  // Émettre un événement local
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtenir l'ID de la socket
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Instance singleton du service temps réel
export const realtimeService = new RealtimeService();

// Hook React pour utiliser les événements temps réel
import { useEffect, useState } from 'react';

export function useRealtimeEvent<T>(event: string, initialValue?: T): T | undefined {
  const [data, setData] = useState<T | undefined>(initialValue);

  useEffect(() => {
    const handleEvent = (eventData: T) => {
      setData(eventData);
    };

    realtimeService.on(event, handleEvent);

    return () => {
      realtimeService.off(event, handleEvent);
    };
  }, [event]);

  return data;
}

// Hook pour les mises à jour de position des chauffeurs
export function useDriverLocationUpdates(): Map<string, DriverLocationUpdate> {
  const [driverLocations, setDriverLocations] = useState<Map<string, DriverLocationUpdate>>(new Map());

  useEffect(() => {
    const handleLocationUpdate = (update: DriverLocationUpdate) => {
      setDriverLocations(prev => new Map(prev.set(update.driverId, update)));
    };

    realtimeService.on('driverLocationUpdate', handleLocationUpdate);

    return () => {
      realtimeService.off('driverLocationUpdate', handleLocationUpdate);
    };
  }, []);

  return driverLocations;
}

// Hook pour les mises à jour des courses
export function useTripUpdates(): Map<string, TripUpdate> {
  const [tripUpdates, setTripUpdates] = useState<Map<string, TripUpdate>>(new Map());

  useEffect(() => {
    const handleTripUpdate = (update: TripUpdate) => {
      setTripUpdates(prev => new Map(prev.set(update.tripId, update)));
    };

    realtimeService.on('tripUpdate', handleTripUpdate);

    return () => {
      realtimeService.off('tripUpdate', handleTripUpdate);
    };
  }, []);

  return tripUpdates;
}