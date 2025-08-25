import { 
  LayoutDashboard, 
  Users, 
  Car, 
  HeadphonesIcon, 
  BarChart3, 
  Settings,
  Ticket,
  MessageCircle,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    category: 'Administration'
  },
  {
    id: 'trips',
    label: 'Courses',
    icon: MapPin,
    category: 'Administration'
  },
  {
    id: 'drivers',
    label: 'Chauffeurs',
    icon: Users,
    category: 'Administration'
  },
  {
    id: 'vehicles',
    label: 'Véhicules',
    icon: Car,
    category: 'Administration'
  },
  {
    id: 'payments',
    label: 'Paiements',
    icon: BarChart3,
    category: 'Administration'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    category: 'Administration'
  },
  {
    id: 'support-dashboard',
    label: 'Support Dashboard',
    icon: HeadphonesIcon,
    category: 'Support'
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: Ticket,
    category: 'Support'
  },
  {
    id: 'chat',
    label: 'Chat en Direct',
    icon: MessageCircle,
    category: 'Support'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    category: 'Système'
  }
];

export const Sidebar = ({ activeTab, onTabChange, isOpen }: SidebarProps) => {
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className={cn(
      "h-full bg-white border-r border-border flex flex-col",
      isOpen ? "w-64" : "w-0 lg:w-64"
    )}>
      <div className="p-6 space-y-6 overflow-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
              {category}
            </h3>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id ? "bg-primary text-white shadow-sm" : "text-foreground hover:bg-secondary"
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};