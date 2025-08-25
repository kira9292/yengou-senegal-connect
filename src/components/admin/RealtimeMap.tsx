import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Car,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter
} from 'lucide-react';
import { useDriverLocationUpdates, realtimeService } from '@/services/realtimeService';
import { tripService } from '@/services/tripService';
import 'leaflet/dist/leaflet.css';

// Types pour la carte
interface MapDriver {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  vehicleType: string;
  phoneNumber?: string;
  currentTripId?: string;
}

interface MapTrip {
  id: string;
  driverId: string;
  clientName: string;
  status: 'IN_TRANSIT' | 'PICKUP';
  departure: { lat: number; lng: number; name: string };
  arrival: { lat: number; lng: number; name: string };
  progress: number;
}

export const RealtimeMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  
  const [drivers, setDrivers] = useState<MapDriver[]>([]);
  const [trips, setTrips] = useState<MapTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filters, setFilters] = useState({
    showAvailable: true,
    showBusy: true,
    showOffline: false,
    showTrips: true,
  });

  // Hook pour les mises à jour de position en temps réel
  const driverLocationUpdates = useDriverLocationUpdates();

  // Initialiser la carte Leaflet
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        // Import dynamique de Leaflet (côté client uniquement)
        const L = (await import('leaflet')).default;
        
        // Corriger les icônes par défaut de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Créer la carte centrée sur Dakar
        mapInstance.current = L.map(mapRef.current).setView([14.6928, -17.4467], 12);

        // Ajouter la couche de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Mettre à jour les positions des chauffeurs en temps réel
  useEffect(() => {
    driverLocationUpdates.forEach((locationUpdate, driverId) => {
      setDrivers(prevDrivers => {
        const updatedDrivers = [...prevDrivers];
        const driverIndex = updatedDrivers.findIndex(d => d.id === driverId);
        
        if (driverIndex >= 0) {
          updatedDrivers[driverIndex] = {
            ...updatedDrivers[driverIndex],
            latitude: locationUpdate.latitude,
            longitude: locationUpdate.longitude,
            status: locationUpdate.status,
          };
        } else {
          // Nouveau chauffeur
          updatedDrivers.push({
            id: driverId,
            name: `Chauffeur ${driverId.slice(-4)}`,
            latitude: locationUpdate.latitude,
            longitude: locationUpdate.longitude,
            status: locationUpdate.status,
            vehicleType: 'sedan', // À récupérer depuis l'API
          });
        }
        
        return updatedDrivers;
      });
    });
  }, [driverLocationUpdates]);

  // Mettre à jour les marqueurs sur la carte
  useEffect(() => {
    if (!mapInstance.current) return;

    const updateMapMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Nettoyer les anciens marqueurs
      markersRef.current.forEach(marker => {
        mapInstance.current.removeLayer(marker);
      });
      markersRef.current.clear();

      // Ajouter les marqueurs des chauffeurs
      drivers.forEach(driver => {
        if (!shouldShowDriver(driver)) return;

        const icon = getDriverIcon(L, driver.status, driver.vehicleType);
        const marker = L.marker([driver.latitude, driver.longitude], { icon })
          .addTo(mapInstance.current);

        // Popup avec informations du chauffeur
        const popupContent = `
          <div class="text-sm">
            <h4 class="font-semibold">${driver.name}</h4>
            <p>Status: ${getStatusLabel(driver.status)}</p>
            <p>Véhicule: ${driver.vehicleType}</p>
            ${driver.phoneNumber ? `<p>Tél: ${driver.phoneNumber}</p>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        markersRef.current.set(`driver-${driver.id}`, marker);
      });

      // Ajouter les marqueurs des courses si activé
      if (filters.showTrips) {
        trips.forEach(trip => {
          // Marqueur départ (vert)
          const departureIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const departureMarker = L.marker([trip.departure.lat, trip.departure.lng], { icon: departureIcon })
            .addTo(mapInstance.current);
          
          departureMarker.bindPopup(`
            <div class="text-sm">
              <h4 class="font-semibold">Départ</h4>
              <p>${trip.departure.name}</p>
              <p>Course: ${trip.id.slice(-8)}</p>
              <p>Client: ${trip.clientName}</p>
            </div>
          `);

          // Marqueur arrivée (rouge)
          const arrivalIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #EF4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const arrivalMarker = L.marker([trip.arrival.lat, trip.arrival.lng], { icon: arrivalIcon })
            .addTo(mapInstance.current);

          arrivalMarker.bindPopup(`
            <div class="text-sm">
              <h4 class="font-semibold">Arrivée</h4>
              <p>${trip.arrival.name}</p>
              <p>Course: ${trip.id.slice(-8)}</p>
              <p>Client: ${trip.clientName}</p>
            </div>
          `);

          markersRef.current.set(`trip-departure-${trip.id}`, departureMarker);
          markersRef.current.set(`trip-arrival-${trip.id}`, arrivalMarker);
        });
      }
    };

    updateMapMarkers();
  }, [drivers, trips, filters]);

  // Créer une icône personnalisée pour un chauffeur
  const getDriverIcon = (L: any, status: string, vehicleType: string) => {
    const colors = {
      AVAILABLE: '#10B981', // Vert
      BUSY: '#F59E0B',      // Orange
      OFFLINE: '#6B7280'    // Gris
    };

    const color = colors[status as keyof typeof colors] || colors.OFFLINE;
    
    return L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div style="
          background: ${color}; 
          width: 20px; 
          height: 20px; 
          border-radius: 50%; 
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="color: white; font-size: 10px; font-weight: bold;">
            ${vehicleType === 'sedan' ? '🚗' : vehicleType === 'suv' ? '🚙' : '🏍️'}
          </div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  };

  const shouldShowDriver = (driver: MapDriver) => {
    switch (driver.status) {
      case 'AVAILABLE':
        return filters.showAvailable;
      case 'BUSY':
        return filters.showBusy;
      case 'OFFLINE':
        return filters.showOffline;
      default:
        return false;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      AVAILABLE: 'Disponible',
      BUSY: 'Occupé',
      OFFLINE: 'Hors ligne'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-success',
      BUSY: 'bg-warning',
      OFFLINE: 'bg-muted'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      // Charger les courses actives
      const activeTrips = await tripService.getActiveTrips();
      
      const mapTrips: MapTrip[] = activeTrips.map(trip => ({
        id: trip.id,
        driverId: trip.driver?.id || '',
        clientName: `${trip.client?.firstName} ${trip.client?.lastName}`,
        status: trip.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'PICKUP',
        departure: {
          lat: trip.service.departureLatitude,
          lng: trip.service.departureLongitude,
          name: trip.service.departureLocationName
        },
        arrival: {
          lat: trip.service.arrivalLatitude,
          lng: trip.service.arrivalLongitude,
          name: trip.service.arrivalLocationName
        },
        progress: trip.status === 'IN_TRANSIT' ? 50 : 0, // Simulation
      }));

      setTrips(mapTrips);
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const zoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const driverCounts = {
    available: drivers.filter(d => d.status === 'AVAILABLE').length,
    busy: drivers.filter(d => d.status === 'BUSY').length,
    offline: drivers.filter(d => d.status === 'OFFLINE').length,
    total: drivers.length,
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5" />
            <span>Carte Temps Réel</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Statistiques rapides */}
            <div className="flex items-center space-x-2 text-sm">
              <Badge className="bg-success text-white">
                {driverCounts.available} disponibles
              </Badge>
              <Badge className="bg-warning text-white">
                {driverCounts.busy} occupés
              </Badge>
              <Badge className="bg-muted text-muted-foreground">
                {driverCounts.offline} hors ligne
              </Badge>
            </div>

            {/* Contrôles */}
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        {/* Filtres */}
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Filtres</div>
          <div className="space-y-1">
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showAvailable}
                onChange={() => toggleFilter('showAvailable')}
                className="rounded"
              />
              <span>Disponibles</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showBusy}
                onChange={() => toggleFilter('showBusy')}
                className="rounded"
              />
              <span>Occupés</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showOffline}
                onChange={() => toggleFilter('showOffline')}
                className="rounded"
              />
              <span>Hors ligne</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showTrips}
                onChange={() => toggleFilter('showTrips')}
                className="rounded"
              />
              <span>Courses</span>
            </label>
          </div>
        </div>

        {/* Contrôles de zoom */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1">
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Carte */}
        <div 
          ref={mapRef} 
          className={`${isFullscreen ? 'h-screen' : 'h-96'} w-full bg-muted relative`}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-50">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
              </div>
            </div>
          )}
          {!mapRef.current && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Carte non disponible</p>
                <p className="text-xs text-muted-foreground">Vérifiez votre connexion</p>
              </div>
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Légende</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Chauffeur disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Chauffeur occupé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              <span>Chauffeur hors ligne</span>
            </div>
            {filters.showTrips && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-success border-2 border-white"></div>
                  <span>Point de départ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive border-2 border-white"></div>
                  <span>Point d'arrivée</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};