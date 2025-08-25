import { Bell, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
  notifications: number;
}

export const Header = ({ onMenuClick, userName, notifications }: HeaderProps) => {
  return (
    <header className="h-16 bg-gradient-primary border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-blue animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden text-primary-foreground hover:bg-primary-glow/20"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-ocean rounded-lg flex items-center justify-center text-xl font-bold text-primary shadow-elegant">
            Y
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">YENGOU</h1>
            <p className="text-sm text-primary-foreground/90">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-glow/20 relative"
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-glow/20 h-8 w-8 rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};