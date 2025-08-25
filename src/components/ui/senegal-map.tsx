import { MapPin, Car, Navigation } from "lucide-react";
import { TripLocation, DriverLocation } from "@/types/yengou";
import { Badge } from "@/components/ui/badge";

interface SenegalMapProps {
  trips: TripLocation[];
  drivers: DriverLocation[];
  onTripClick?: (trip: TripLocation) => void;
  onDriverClick?: (driver: DriverLocation) => void;
}

export const SenegalMap = ({ trips, drivers, onTripClick, onDriverClick }: SenegalMapProps) => {
  // Simulation d'une carte de Dakar avec positions relatives
  const mapStyle = {
    backgroundImage: `
      radial-gradient(circle at 30% 40%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, hsl(var(--secondary) / 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 70%, hsl(var(--accent) / 0.1) 0%, transparent 50%)
    `,
    backgroundSize: '100% 100%'
  };

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-br from-muted/30 to-background rounded-lg border overflow-hidden"
      style={mapStyle}
    >
      {/* Indicateur de zone - Dakar */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="outline" className="bg-background/90 text-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          Dakar, Sénégal
        </Badge>
      </div>

      {/* Légende */}
      <div className="absolute top-4 right-4 z-10 bg-background/90 p-3 rounded-lg border space-y-2">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Chauffeurs disponibles ({drivers.filter(d => d.status === 'available').length})</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-warning"></div>
          <span>Chauffeurs occupés ({drivers.filter(d => d.status === 'busy').length})</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-accent"></div>
          <span>Courses actives ({trips.length})</span>
        </div>
      </div>

      {/* Chauffeurs sur la carte */}
      {drivers.map((driver, index) => (
        <div
          key={driver.driverId}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
            onDriverClick ? 'hover:shadow-lg' : ''
          }`}
          style={{
            left: `${20 + (index * 15) % 60}%`,
            top: `${25 + (index * 12) % 50}%`
          }}
          onClick={() => onDriverClick?.(driver)}
        >
          <div className={`
            w-4 h-4 rounded-full border-2 border-white shadow-md
            ${driver.status === 'available' ? 'bg-primary' : 
              driver.status === 'busy' ? 'bg-warning' : 'bg-muted'}
          `}>
            <Car className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
          </div>
          {driver.status === 'available' && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs whitespace-nowrap shadow-sm border">
              {driver.name}
            </div>
          )}
        </div>
      ))}

      {/* Courses sur la carte */}
      {trips.map((trip, index) => (
        <div
          key={trip.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
            onTripClick ? 'hover:shadow-lg' : ''
          }`}
          style={{
            left: `${30 + (index * 18) % 40}%`,
            top: `${35 + (index * 16) % 30}%`
          }}
          onClick={() => onTripClick?.(trip)}
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-accent border-2 border-white shadow-md flex items-center justify-center">
              <Navigation className="w-3 h-3 text-white" />
            </div>
            {/* Animation de pulsation pour les courses actives */}
            {trip.status === 'active' && (
              <div className="absolute inset-0 w-5 h-5 rounded-full bg-accent animate-ping opacity-75"></div>
            )}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 p-2 rounded text-xs shadow-sm border min-w-[120px] text-center">
              <div className="font-medium">Course #{trip.id.slice(-4)}</div>
              <div className="text-muted-foreground">
                {trip.status === 'active' ? 'En cours' : 
                 trip.status === 'waiting' ? 'En attente' : 'Terminé'}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Zones de concentration (heatmap simulée) */}
      <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-primary/20 rounded-full blur-sm"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-secondary/20 rounded-full blur-sm"></div>
      <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-accent/20 rounded-full blur-sm"></div>

      {/* Indicateur temps réel */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-2 bg-background/90 px-3 py-2 rounded-lg border">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        <span className="text-xs text-foreground">Mise à jour temps réel</span>
      </div>

      {/* Zone de statut */}
      <div className="absolute bottom-4 right-4 z-10 bg-background/90 p-3 rounded-lg border">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Drivers:</span>
            <span className="font-medium">{drivers.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trips:</span>
            <span className="font-medium">{trips.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zone:</span>
            <span className="font-medium">Dakar Centre</span>
          </div>
        </div>
      </div>
    </div>
  );
};