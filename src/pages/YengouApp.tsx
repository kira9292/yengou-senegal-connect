import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SupportDashboard } from "@/components/support/SupportDashboard";
import { 
  AdminMetrics, 
  TripLocation, 
  DriverLocation, 
  SystemAlert,
  SupportMetrics,
  Ticket,
  ChatSession
} from "@/types/yengou";

export const YengouApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Données mockées pour la démo
  const [adminMetrics] = useState<AdminMetrics>({
    activeTrips: 156,
    onlineDrivers: 89,
    dailyRevenue: 2850000,
    userSatisfaction: 4.7
  });

  const [trips] = useState<TripLocation[]>([
    {
      id: "trip-001",
      lat: 14.6937,
      lng: -17.4441,
      status: "active",
      driverId: "driver-001",
      customerId: "customer-001",
      destination: "Plateau"
    },
    {
      id: "trip-002",
      lat: 14.7167,
      lng: -17.4677,
      status: "waiting",
      driverId: "driver-002",
      customerId: "customer-002",
      destination: "Almadies"
    },
    {
      id: "trip-003",
      lat: 14.6892,
      lng: -17.4492,
      status: "active",
      driverId: "driver-003",
      customerId: "customer-003",
      destination: "Médina"
    }
  ]);

  const [drivers] = useState<DriverLocation[]>([
    {
      driverId: "driver-001",
      name: "Ibrahima Diop",
      lat: 14.6937,
      lng: -17.4441,
      status: "busy",
      vehicleType: "sedan",
      rating: 4.8
    },
    {
      driverId: "driver-002",
      name: "Fatou Sall",
      lat: 14.7167,
      lng: -17.4677,
      status: "available",
      vehicleType: "suv",
      rating: 4.9
    },
    {
      driverId: "driver-003",
      name: "Moussa Ba",
      lat: 14.6892,
      lng: -17.4492,
      status: "busy",
      vehicleType: "sedan",
      rating: 4.6
    },
    {
      driverId: "driver-004",
      name: "Aminata Kane",
      lat: 14.7021,
      lng: -17.4589,
      status: "available",
      vehicleType: "wagon",
      rating: 4.7
    }
  ]);

  const [alerts] = useState<SystemAlert[]>([
    {
      id: "alert-001",
      type: "warning",
      message: "Forte demande détectée dans la zone Plateau. 15+ courses en attente.",
      timestamp: new Date(Date.now() - 300000),
      isRead: false
    },
    {
      id: "alert-002",
      type: "info",
      message: "Nouveau chauffeur Amadou Sy validé et ajouté à la flotte.",
      timestamp: new Date(Date.now() - 900000),
      isRead: false
    },
    {
      id: "alert-003",
      type: "error",
      message: "Problème de connexion avec le service de paiement Orange Money.",
      timestamp: new Date(Date.now() - 1800000),
      isRead: true
    }
  ]);

  const [supportMetrics] = useState<SupportMetrics>({
    totalTickets: 1247,
    openTickets: 67,
    averageResponseTime: 12,
    customerSatisfaction: 4.6,
    resolvedToday: 45
  });

  const [recentTickets] = useState<Ticket[]>([
    {
      id: "ticket-001",
      title: "Problème de facturation course #12456",
      description: "Le montant facturé ne correspond pas au tarif affiché",
      status: "open",
      priority: "high",
      customerId: "cust-001",
      customerName: "Marie Diagne",
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 1800000),
      category: "billing"
    },
    {
      id: "ticket-002",
      title: "Chauffeur en retard de 20 minutes",
      description: "Le chauffeur n'est toujours pas arrivé au point de rendez-vous",
      status: "in_progress",
      priority: "urgent",
      customerId: "cust-002",
      customerName: "Ousmane Fall",
      assignedTo: "agent-001",
      createdAt: new Date(Date.now() - 1200000),
      updatedAt: new Date(Date.now() - 300000),
      category: "driver_issue"
    }
  ]);

  const [activeChatSessions] = useState<ChatSession[]>([
    {
      id: "chat-001",
      customerId: "cust-003",
      customerName: "Aissatou Thiam",
      agentId: "agent-002",
      agentName: "Support Agent",
      status: "active",
      messages: [],
      startedAt: new Date(Date.now() - 600000),
      lastActivity: new Date(Date.now() - 60000)
    },
    {
      id: "chat-002",
      customerId: "cust-004",
      customerName: "Mamadou Ndiaye",
      status: "waiting",
      messages: [],
      startedAt: new Date(Date.now() - 300000),
      lastActivity: new Date(Date.now() - 120000)
    }
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            metrics={adminMetrics}
            trips={trips}
            drivers={drivers}
            alerts={alerts}
          />
        );
      case 'support-dashboard':
        return (
          <SupportDashboard
            metrics={supportMetrics}
            recentTickets={recentTickets}
            activeChatSessions={activeChatSessions}
          />
        );
      case 'trips':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestion des Courses</h2>
            <p className="text-muted-foreground">Module de gestion des courses en développement...</p>
          </div>
        );
      case 'drivers':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestion des Chauffeurs</h2>
            <p className="text-muted-foreground">Module de gestion des chauffeurs en développement...</p>
          </div>
        );
      case 'vehicles':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestion des Véhicules</h2>
            <p className="text-muted-foreground">Module de gestion des véhicules en développement...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Analytics Avancées</h2>
            <p className="text-muted-foreground">Module d'analytics en développement...</p>
          </div>
        );
      case 'tickets':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestion des Tickets</h2>
            <p className="text-muted-foreground">Module de gestion des tickets en développement...</p>
          </div>
        );
      case 'chat':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Chat en Direct</h2>
            <p className="text-muted-foreground">Interface de chat en développement...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Paramètres Système</h2>
            <p className="text-muted-foreground">Module de paramètres en développement...</p>
          </div>
        );
      default:
        return (
          <AdminDashboard
            metrics={adminMetrics}
            trips={trips}
            drivers={drivers}
            alerts={alerts}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Admin YENGOU"
          notifications={alerts.filter(a => !a.isRead).length}
        />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};