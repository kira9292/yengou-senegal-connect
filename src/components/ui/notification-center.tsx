import { Bell, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { SystemAlert } from "@/types/yengou";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationCenterProps {
  notifications: SystemAlert[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  maxHeight?: string;
}

export const NotificationCenter = ({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead,
  maxHeight = "300px"
}: NotificationCenterProps) => {
  
  const getIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info':
        return <Info className="h-4 w-4 text-info" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBadgeVariant = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle className="h-12 w-12 text-success mb-3" />
        <p className="text-sm text-muted-foreground">Aucune alerte système</p>
        <p className="text-xs text-muted-foreground">Tout fonctionne correctement</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {unreadCount > 0 && onMarkAllRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-xs h-6 px-2"
          >
            Tout marquer lu
          </Button>
        )}
      </div>

      {/* Liste des notifications */}
      <ScrollArea className="w-full" style={{ maxHeight }}>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                relative p-3 rounded-lg border transition-all duration-200 hover:shadow-sm
                ${notification.isRead 
                  ? 'bg-muted/50 border-border' 
                  : 'bg-card border-primary/20 shadow-sm'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Icône du type d'alerte */}
                <div className="mt-0.5">
                  {getIcon(notification.type)}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                      {notification.type === 'error' ? 'Erreur' :
                       notification.type === 'warning' ? 'Attention' : 'Info'}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {onMarkRead && !notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkRead(notification.id)}
                          className="h-6 w-6 p-0 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {/* Indicateur non lu */}
                  {!notification.isRead && (
                    <div className="absolute left-1 top-3 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};