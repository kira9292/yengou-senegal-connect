import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeadphonesIcon, 
  Ticket, 
  Clock, 
  TrendingUp,
  MessageCircle,
  Users,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { SupportMetrics, Ticket as TicketType, ChatSession } from "@/types/yengou";
import { RealtimeMetrics } from "@/components/ui/realtime-metrics";

interface SupportDashboardProps {
  metrics: SupportMetrics;
  recentTickets: TicketType[];
  activeChatSessions: ChatSession[];
}

export const SupportDashboard = ({ 
  metrics, 
  recentTickets, 
  activeChatSessions 
}: SupportDashboardProps) => {
  
  const responseTimeData = [
    { name: '08h', value: 15 },
    { name: '10h', value: 12 },
    { name: '12h', value: 8 },
    { name: '14h', value: 18 },
    { name: '16h', value: 14 },
    { name: '18h', value: 11 },
  ];

  const ticketsByCategory = [
    { name: 'Technique', value: 45 },
    { name: 'Facturation', value: 32 },
    { name: 'Chauffeur', value: 28 },
    { name: 'Général', value: 15 },
  ];

  const getPriorityColor = (priority: TicketType['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-accent text-accent-foreground';
      case 'medium':
        return 'bg-warning text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: TicketType['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-3 w-3" />;
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      case 'resolved':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <Ticket className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Support Dashboard</h2>
          <p className="text-muted-foreground">Gestion du support client YENGOU</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-gradient-primary text-primary-foreground">
            <MessageCircle className="h-3 w-3 mr-1" />
            {activeChatSessions.length} chats actifs
          </Badge>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-primary text-primary-foreground shadow-blue animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Ouverts</CardTitle>
            <Ticket className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.openTickets}</div>
            <p className="text-xs opacity-90">
              Sur {metrics.totalTickets} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-depth text-white shadow-elegant animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}min</div>
            <p className="text-xs opacity-90">
              Moyenne aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-ocean text-primary shadow-glow animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerSatisfaction}★</div>
            <p className="text-xs opacity-80">
              Note moyenne client
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-primary-dark text-accent-foreground shadow-blue animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus Aujourd'hui</CardTitle>
            <CheckCircle2 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resolvedToday}</div>
            <p className="text-xs opacity-90">
              +15% vs hier
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary-glow to-primary text-white shadow-elegant animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chats Actifs</CardTitle>
            <MessageCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeChatSessions.length}</div>
            <p className="text-xs opacity-90">
              Sessions en cours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets récents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-primary" />
                <span>Tickets Récents</span>
              </CardTitle>
              <CardDescription>
                Dernières demandes de support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTickets.slice(0, 6).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <p className="text-sm font-medium">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">{ticket.customerName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`text-xs ${getPriorityColor(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions de chat actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>Chats en Direct</span>
            </CardTitle>
            <CardDescription>
              Conversations en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeChatSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {session.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{session.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.status === 'waiting' ? 'En attente' : 'Conversation active'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={session.status === 'waiting' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {session.status === 'waiting' ? 'Attente' : 'Actif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temps de Réponse</CardTitle>
            <CardDescription>Évolution du temps de réponse moyen (minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeMetrics
              data={responseTimeData}
              chartType="line"
              color="hsl(var(--warning))"
              label="Minutes"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets par Catégorie</CardTitle>
            <CardDescription>Distribution des demandes cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeMetrics
              data={ticketsByCategory}
              chartType="bar"
              color="hsl(var(--accent))"
              label="Nombre de tickets"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};