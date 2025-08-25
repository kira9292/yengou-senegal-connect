import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  Navigation,
  Clock,
  MoreHorizontal,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Car,
  User,
  Phone,
  Calendar
} from 'lucide-react';
import { tripService, serviceEntityService, Trip, ServiceEntity } from '@/services/tripService';
import { realtimeService, useTripUpdates, useDriverLocationUpdates } from '@/services/realtimeService';
import { toast } from '@/hooks/use-toast';

export const TripMonitoring = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');

  // Hooks temps réel
  const tripUpdates = useTripUpdates();
  const driverLocations = useDriverLocationUpdates();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    tripUpdates.forEach((update, tripId) => {
      setTrips(prev => prev.map(trip => 
        trip.id === tripId ? { ...trip, status: update.status } : trip
      ));
    });
  }, [tripUpdates]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'active':
          const activeTrips = await tripService.getActiveTrips();
          setTrips(activeTrips);
          break;
        case 'pending':
          const pendingServices = await serviceEntityService.getPendingServices();
          setServices(pendingServices);
          break;
        case 'completed':
          const completedTrips = await tripService.getTripsByStatus('COMPLETED');
          setTrips(completedTrips);
          break;
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = async (tripId: string, newStatus: string) => {
    try {
      await tripService.updateTripStatus(tripId, newStatus);
      await loadData();
      
      toast({
        title: "Succès",
        description: "Statut de la course mis à jour",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const cancelTrip = async (tripId: string) => {
    const reason = prompt('Raison de l\'annulation:');
    if (!reason) return;

    try {
      await tripService.cancelTrip(tripId, reason);
      await loadData();
      
      toast({
        title: "Succès",
        description: "Course annulée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la course",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary' as const, label: 'En attente' },
      'ACCEPTED': { variant: 'default' as const, label: 'Acceptée' },
      'IN_TRANSIT': { variant: 'default' as const, label: 'En cours', className: 'bg-primary' },
      'COMPLETED': { variant: 'default' as const, label: 'Terminée', className: 'bg-success' },
      'CANCELLED': { variant: 'destructive' as const, label: 'Annulée' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getServiceTypeBadge = (type: string) => {
    const typeConfig = {
      'TRAVEL': { className: 'bg-blue-500', label: 'Voyage' },
      'EXPRESS': { className: 'bg-orange-500', label: 'Express' },
      'PACKAGE': { className: 'bg-purple-500', label: 'Colis' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.TRAVEL;
    
    return (
      <Badge className={`${config.className} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5" />
            <span>Suivi des Courses</span>
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel des courses et services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Onglets */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === 'active' ? 'default' : 'outline'}
              onClick={() => setActiveTab('active')}
            >
              Courses actives
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pending')}
            >
              Services en attente
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'default' : 'outline'}
              onClick={() => setActiveTab('completed')}
            >
              Courses terminées
            </Button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">{trips.length}</div>
              <div className="text-sm text-muted-foreground">
                {activeTab === 'active' ? 'Actives' : 'Total'}
              </div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-success">
                {trips.filter(t => t.status === 'IN_TRANSIT').length}
              </div>
              <div className="text-sm text-muted-foreground">En transit</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {trips.filter(t => t.status === 'ACCEPTED').length}
              </div>
              <div className="text-sm text-muted-foreground">Acceptées</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {trips.reduce((sum, t) => sum + (t.price || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">FCFA Total</div>
            </div>
          </div>

          {/* Tableau principal */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Trajet</TableHead>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : activeTab === 'pending' ? (
                  // Services en attente
                  services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun service en attente
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">#{service.id.slice(-8)}</div>
                            <div className="flex items-center space-x-2">
                              {getServiceTypeBadge(service.serviceType)}
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(service.requestDate)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-green-500" />
                              {service.departureLocationName}
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-red-500" />
                              {service.arrivalLocationName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">Non assigné</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {service.client.firstName} {service.client.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {service.client.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(service.status)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{service.price.toLocaleString()} FCFA</span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Assigner chauffeur
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  // Courses (actives ou terminées)
                  trips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucune course trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">#{trip.id.slice(-8)}</div>
                            <div className="flex items-center space-x-2">
                              {getServiceTypeBadge(trip.service.serviceType)}
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(trip.startTime)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-green-500" />
                              {trip.service.departureLocationName}
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-red-500" />
                              {trip.service.arrivalLocationName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {trip.distance.toFixed(1)} km • {formatDuration(trip.duration)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {trip.driver ? (
                            <div>
                              <div className="font-medium">
                                {trip.driver.firstName} {trip.driver.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {trip.driver.phoneNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non assigné</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {trip.client ? (
                            <div>
                              <div className="font-medium">
                                {trip.client.firstName} {trip.client.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {trip.client.phoneNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(trip.status)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{trip.price.toLocaleString()} FCFA</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedTrip(trip)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              {trip.status === 'IN_TRANSIT' && (
                                <DropdownMenuItem 
                                  onClick={() => updateTripStatus(trip.id, 'COMPLETED')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marquer terminée
                                </DropdownMenuItem>
                              )}
                              {['ACCEPTED', 'IN_TRANSIT'].includes(trip.status) && (
                                <DropdownMenuItem 
                                  onClick={() => cancelTrip(trip.id)}
                                  className="text-destructive"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Annuler
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal détails de la course */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la course</DialogTitle>
            <DialogDescription>
              Informations complètes et suivi en temps réel
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrip && (
            <div className="space-y-6">
              {/* En-tête avec statut */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Course #{selectedTrip.id.slice(-8)}</h3>
                  <p className="text-muted-foreground">{formatDateTime(selectedTrip.startTime)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getServiceTypeBadge(selectedTrip.service.serviceType)}
                  {getStatusBadge(selectedTrip.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations du trajet */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Trajet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <div className="font-medium">Départ</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTrip.service.departureLocationName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-red-500 mt-1" />
                      <div>
                        <div className="font-medium">Arrivée</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTrip.service.arrivalLocationName}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <strong>Distance:</strong> {selectedTrip.distance.toFixed(1)} km
                      </div>
                      <div className="text-sm">
                        <strong>Durée:</strong> {formatDuration(selectedTrip.duration)}
                      </div>
                      <div className="text-sm">
                        <strong>Prix:</strong> {selectedTrip.price.toLocaleString()} FCFA
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations des participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Participants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Chauffeur */}
                    <div className="flex items-start space-x-2">
                      <Car className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="font-medium">Chauffeur</div>
                        {selectedTrip.driver ? (
                          <div className="text-sm text-muted-foreground">
                            <div>{selectedTrip.driver.firstName} {selectedTrip.driver.lastName}</div>
                            <div>{selectedTrip.driver.phoneNumber}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Non assigné</div>
                        )}
                      </div>
                    </div>

                    {/* Client */}
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 text-secondary mt-1" />
                      <div>
                        <div className="font-medium">Client</div>
                        {selectedTrip.client ? (
                          <div className="text-sm text-muted-foreground">
                            <div>{selectedTrip.client.firstName} {selectedTrip.client.lastName}</div>
                            <div>{selectedTrip.client.phoneNumber}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Information non disponible</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                {selectedTrip.status === 'IN_TRANSIT' && (
                  <Button 
                    onClick={() => {
                      updateTripStatus(selectedTrip.id, 'COMPLETED');
                      setSelectedTrip(null);
                    }}
                  >
                    Marquer comme terminée
                  </Button>
                )}
                {['ACCEPTED', 'IN_TRANSIT'].includes(selectedTrip.status) && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      cancelTrip(selectedTrip.id);
                      setSelectedTrip(null);
                    }}
                  >
                    Annuler la course
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedTrip(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};