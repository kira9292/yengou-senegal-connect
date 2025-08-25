import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
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
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Car,
  Phone,
  Mail,
  Wallet
} from 'lucide-react';
import { driverService, DriverProfile } from '@/services/driverService';
import { toast } from '@/hooks/use-toast';

interface DriverManagementProps {
  className?: string;
}

export const DriverManagement = ({ className }: DriverManagementProps) => {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des chauffeurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les chauffeurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchDrivers = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchTerm) {
        filters.name = searchTerm;
      }
      
      if (filterStatus !== 'all') {
        filters.accountBanned = filterStatus === 'banned';
      }

      const data = await driverService.searchDriversAdvanced(filters);
      setDrivers(data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDriverBan = async (driverId: string, currentBanStatus: boolean) => {
    try {
      await driverService.toggleBanStatus(driverId, !currentBanStatus);
      await loadDrivers();
      
      toast({
        title: "Succès",
        description: `Chauffeur ${!currentBanStatus ? 'banni' : 'débanni'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut du chauffeur",
        variant: "destructive",
      });
    }
  };

  const updateDriverBalance = async (driverId: string, newBalance: number) => {
    try {
      await driverService.updateBalance(driverId, newBalance);
      await loadDrivers();
      
      toast({
        title: "Succès",
        description: "Solde mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le solde",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (driver: DriverProfile) => {
    if (driver.accountBanned) {
      return <Badge variant="destructive">Banni</Badge>;
    }
    return <Badge className="bg-success text-white">Actif</Badge>;
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = !searchTerm || 
      driver.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user?.phoneNumber?.includes(searchTerm);

    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && !driver.accountBanned) ||
      (filterStatus === 'banned' && driver.accountBanned);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Gestion des Chauffeurs</span>
          </CardTitle>
          <CardDescription>
            Gérer les chauffeurs, leurs statuts et leurs informations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchDrivers()}
              />
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Statut</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    Tous
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Actifs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('banned')}>
                    Bannis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={searchDrivers} disabled={loading}>
                Rechercher
              </Button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">{drivers.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-success">
                {drivers.filter(d => !d.accountBanned).length}
              </div>
              <div className="text-sm text-muted-foreground">Actifs</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {drivers.filter(d => d.accountBanned).length}
              </div>
              <div className="text-sm text-muted-foreground">Bannis</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {drivers.reduce((sum, d) => sum + (d.balance || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">FCFA Total</div>
            </div>
          </div>

          {/* Tableau des chauffeurs */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Véhicules</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun chauffeur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {driver.user?.firstName} {driver.user?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {driver.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {driver.user?.phoneNumber}
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {driver.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {(driver.balance || 0).toLocaleString()} FCFA
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(driver)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{driver.vehicles?.length || 0}</span>
                        </div>
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
                            <DropdownMenuItem onClick={() => setSelectedDriver(driver)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleDriverBan(driver.id, driver.accountBanned)}
                            >
                              {driver.accountBanned ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Débannir
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Bannir
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails du chauffeur */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du chauffeur</DialogTitle>
            <DialogDescription>
              Informations complètes et actions avancées
            </DialogDescription>
          </DialogHeader>
          
          {selectedDriver && (
            <div className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations personnelles</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nom:</span>{' '}
                      {selectedDriver.user?.firstName} {selectedDriver.user?.lastName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Téléphone:</span>{' '}
                      {selectedDriver.user?.phoneNumber}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      {selectedDriver.user?.email}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Statut compte</h4>
                  <div className="space-y-2">
                    {getStatusBadge(selectedDriver)}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Solde:</span>{' '}
                      <span className="font-medium">
                        {(selectedDriver.balance || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant={selectedDriver.accountBanned ? "default" : "destructive"}
                  onClick={() => {
                    toggleDriverBan(selectedDriver.id, selectedDriver.accountBanned);
                    setSelectedDriver(null);
                  }}
                >
                  {selectedDriver.accountBanned ? 'Débannir' : 'Bannir'} le chauffeur
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newBalance = prompt('Nouveau solde (FCFA):', selectedDriver.balance?.toString());
                    if (newBalance && !isNaN(Number(newBalance))) {
                      updateDriverBalance(selectedDriver.id, Number(newBalance));
                      setSelectedDriver(null);
                    }
                  }}
                >
                  Modifier le solde
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};