import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { AdminMetrics, TripLocation, DriverLocation, SystemAlert } from "@/types/yengou";
import { RealtimeMetrics } from "@/components/ui/realtime-metrics";
import { SenegalMap } from "@/components/ui/senegal-map";
import { NotificationCenter } from "@/components/ui/notification-center";
import { RealtimeMap } from "@/components/admin/RealtimeMap";
import { useEffect, useState } from "react";
import { dashboardService, SystemStats, DriverStats, ServiceStats, RecentService, RecentDriver } from "@/services/dashboardService";
import { realtimeService, useRealtimeEvent, useDriverLocationUpdates } from "@/services/realtimeService";
import { toast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  metrics: AdminMetrics;
  trips: TripLocation[];
  drivers: DriverLocation[];
  alerts: SystemAlert[];
}

export const AdminDashboard = ({ metrics: initialMetrics, trips: initialTrips, drivers: initialDrivers, alerts: initialAlerts }: AdminDashboardProps) => {
  // États pour les données temps réel
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [recentDrivers, setRecentDrivers] = useState<RecentDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Hooks temps réel
  const driverLocationUpdates = useDriverLocationUpdates();
  const dashboardUpdate = useRealtimeEvent('dashboardStatsUpdate');
  const systemAlert = useRealtimeEvent('systemAlert');

  // Charger les données initiales
  useEffect(() => {
    loadDashboardData();
    
    // S'abonner aux mises à jour temps réel
    realtimeService.subscribeToDashboard();

    return () => {
      realtimeService.unsubscribeFromDashboard();
    };
  }, []);

  // Gérer les mises à jour temps réel du dashboard
  useEffect(() => {
    if (dashboardUpdate) {
      setSystemStats(dashboardUpdate.systemStats);
      setDriverStats(dashboardUpdate.driverStats);
      setServiceStats(dashboardUpdate.serviceStats);
      setLastUpdate(new Date());
    }
  }, [dashboardUpdate]);

  // Gérer les alertes système
  useEffect(() => {
    if (systemAlert) {
      toast({
        title: systemAlert.title,
        description: systemAlert.message,
        variant: systemAlert.type === 'ERROR' ? 'destructive' : 'default',
      });
    }
  }, [systemAlert]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [stats, drivers, services, recentSvcs, recentDrvs] = await Promise.all([
        dashboardService.getSystemStats(),
        dashboardService.getDriverStats(),
        dashboardService.getServiceStats(),
        dashboardService.getRecentServices(),
        dashboardService.getRecentDrivers()
      ]);

      setSystemStats(stats);
      setDriverStats(drivers);
      setServiceStats(services);
      setRecentServices(recentSvcs);
      setRecentDrivers(recentDrvs);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };
  const revenueData = [
    { name: '00h', value: 0 },
    { name: '04h', value: 1200 },
    { name: '08h', value: 2800 },
    { name: '12h', value: 4200 },
    { name: '16h', value: 3800 },
    { name: '20h', value: 5600 },
  ];

  const tripData = [
    { name: 'Lun', value: 45 },
    { name: 'Mar', value: 52 },
    { name: 'Mer', value: 38 },
    { name: 'Jeu', value: 67 },
    { name: 'Ven', value: 71 },
    { name: 'Sam', value: 89 },
    { name: 'Dim', value: 62 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard Admin</h2>
          <p className="text-muted-foreground">Vue d'ensemble des opérations VTC YENGOU</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Badge className="bg-primary text-white px-3 py-1 rounded-full">
              Temps réel
            </Badge>
            <span className="text-xs text-muted-foreground">
              Mis à jour: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg">
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses Actives</CardTitle>
            <div className="p-2 bg-primary-light rounded-lg">
              <Car className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {serviceStats?.activeServices ?? initialMetrics.activeTrips}
            </div>
            <p className="text-xs text-success font-medium">
              +12% par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chauffeurs en ligne</CardTitle>
            <div className="p-2 bg-primary-light rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {driverStats?.activeDrivers ?? initialMetrics.onlineDrivers}
            </div>
            <p className="text-xs text-muted-foreground">
              Sur {driverStats?.totalDrivers ?? '1,247'} chauffeurs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus du jour</CardTitle>
            <div className="p-2 bg-primary-light rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(systemStats?.revenueToday ?? initialMetrics.dailyRevenue).toLocaleString()} FCFA
            </div>
            <p className="text-xs text-success font-medium">
              +8% objectif atteint
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Satisfaction Client</CardTitle>
            <div className="p-2 bg-primary-light rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{initialMetrics.userSatisfaction}★</div>
            <p className="text-xs text-muted-foreground">
              Moyenne des 7 derniers jours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte en temps réel */}
        <div className="lg:col-span-2">
          <Card className="h-[400px] bg-white border-0 shadow-md">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Carte Temps Réel - Dakar</span>
              </CardTitle>
              <CardDescription>
                Position des chauffeurs et courses en cours
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] p-4">
              <RealtimeMap />
            </CardContent>
          </Card>
        </div>

        {/* Alertes système */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Alertes Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <NotificationCenter notifications={alerts} />
          </CardContent>
        </Card>
      </div>

      {/* Graphiques analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold">Évolution des Revenus</CardTitle>
            <CardDescription>Revenus par tranche horaire aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <RealtimeMetrics
              data={revenueData}
              chartType="area"
              color="hsl(var(--primary))"
              label="Revenus (FCFA)"
            />
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold">Courses par Jour</CardTitle>
            <CardDescription>Nombre de courses cette semaine</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <RealtimeMetrics
              data={tripData}
              chartType="bar"
              color="hsl(var(--primary))"
              label="Nombre de courses"
            />
          </CardContent>
        </Card>
      </div>

      {/* Status des opérations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">API Gateway</span>
                <Badge className="bg-success text-white rounded-full px-3 py-1">Opérationnel</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Base de données</span>
                <Badge className="bg-success text-white rounded-full px-3 py-1">Opérationnel</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Paiements</span>
                <Badge className="bg-warning text-white rounded-full px-3 py-1">Maintenance</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Temps de réponse</span>
                <span className="font-semibold text-foreground">245ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taux de succès</span>
                <span className="font-semibold text-success">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Temps d'attente moyen</span>
                <span className="font-semibold text-foreground">2min 15s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clients actifs</span>
                <span className="font-semibold text-foreground">{(metrics.activeTrips * 1.2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nouveaux aujourd'hui</span>
                <span className="font-semibold text-primary">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rétention 30j</span>
                <span className="font-semibold text-foreground">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};