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
  Clock
} from "lucide-react";
import { AdminMetrics, TripLocation, DriverLocation, SystemAlert } from "@/types/yengou";
import { RealtimeMetrics } from "@/components/ui/realtime-metrics";
import { SenegalMap } from "@/components/ui/senegal-map";
import { NotificationCenter } from "@/components/ui/notification-center";

interface AdminDashboardProps {
  metrics: AdminMetrics;
  trips: TripLocation[];
  drivers: DriverLocation[];
  alerts: SystemAlert[];
}

export const AdminDashboard = ({ metrics, trips, drivers, alerts }: AdminDashboardProps) => {
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
        <div className="flex items-center space-x-2">
          <Badge className="bg-gradient-primary text-primary-foreground">
            Temps réel
          </Badge>
          <Button variant="outline" size="sm">
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-primary-foreground shadow-senegal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Actives</CardTitle>
            <Car className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTrips}</div>
            <p className="text-xs opacity-80">
              +12% par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chauffeurs en ligne</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onlineDrivers}</div>
            <p className="text-xs opacity-70">
              Sur 1,247 chauffeurs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success to-success/80 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du jour</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dailyRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs opacity-80">
              +8% objectif atteint
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Client</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userSatisfaction}★</div>
            <p className="text-xs opacity-80">
              Moyenne des 7 derniers jours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte en temps réel */}
        <div className="lg:col-span-2">
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Carte Temps Réel - Dakar</span>
              </CardTitle>
              <CardDescription>
                Position des chauffeurs et courses en cours
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <SenegalMap trips={trips} drivers={drivers} />
            </CardContent>
          </Card>
        </div>

        {/* Alertes système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Alertes Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationCenter notifications={alerts} />
          </CardContent>
        </Card>
      </div>

      {/* Graphiques analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Revenus</CardTitle>
            <CardDescription>Revenus par tranche horaire aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeMetrics
              data={revenueData}
              chartType="area"
              color="hsl(var(--primary))"
              label="Revenus (FCFA)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses par Jour</CardTitle>
            <CardDescription>Nombre de courses cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeMetrics
              data={tripData}
              chartType="bar"
              color="hsl(var(--secondary))"
              label="Nombre de courses"
            />
          </CardContent>
        </Card>
      </div>

      {/* Status des opérations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">API Gateway</span>
                <Badge variant="outline" className="bg-success text-white">Opérationnel</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Base de données</span>
                <Badge variant="outline" className="bg-success text-white">Opérationnel</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Paiements</span>
                <Badge variant="outline" className="bg-warning text-white">Maintenance</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="h-5 w-5 text-info" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Temps de réponse</span>
                <span className="font-semibold">245ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taux de succès</span>
                <span className="font-semibold text-success">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Temps d'attente moyen</span>
                <span className="font-semibold">2min 15s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Clients actifs</span>
                <span className="font-semibold">{(metrics.activeTrips * 1.2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Nouveaux aujourd'hui</span>
                <span className="font-semibold text-primary">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rétention 30j</span>
                <span className="font-semibold">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};