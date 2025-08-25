import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  Headphones, 
  Mail, 
  Lock,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const { login, adminLogin, supportLogin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États des formulaires
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  });

  const [supportForm, setSupportForm] = useState({
    username: '',
    password: ''
  });

  const [userForm, setUserForm] = useState({
    username: '',
    password: ''
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminForm.username || !adminForm.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await adminLogin({
        username: adminForm.username,
        password: adminForm.password
      });

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'interface d'administration YENGOU",
      });

      onLoginSuccess?.();
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Erreur de connexion');
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez vos identifiants d'administrateur",
        variant: "destructive",
      });
    }
  };

  const handleSupportLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supportForm.username || !supportForm.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await supportLogin({
        username: supportForm.username,
        password: supportForm.password
      });

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'interface de support YENGOU",
      });

      onLoginSuccess?.();
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Erreur de connexion');
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez vos identifiants de support",
        variant: "destructive",
      });
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userForm.username || !userForm.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login({
        username: userForm.username,
        password: userForm.password
      });

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur YENGOU",
      });

      onLoginSuccess?.();
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Erreur de connexion');
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez vos identifiants",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">Y</span>
          </div>
          <CardTitle className="text-2xl">YENGOU VTC</CardTitle>
          <CardDescription>
            Connectez-vous à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin" className="text-xs">
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="support" className="text-xs">
                <Headphones className="h-4 w-4 mr-1" />
                Support
              </TabsTrigger>
              <TabsTrigger value="user" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                Utilisateur
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Connexion Admin */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="admin@yengou.com"
                      className="pl-10"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter en tant qu\'Admin'}
                </Button>
              </form>
            </TabsContent>

            {/* Connexion Support */}
            <TabsContent value="support">
              <form onSubmit={handleSupportLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support-username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="support-username"
                      type="text"
                      placeholder="support@yengou.com"
                      className="pl-10"
                      value={supportForm.username}
                      onChange={(e) => setSupportForm({...supportForm, username: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="support-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={supportForm.password}
                      onChange={(e) => setSupportForm({...supportForm, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter en tant que Support'}
                </Button>
              </form>
            </TabsContent>

            {/* Connexion Utilisateur */}
            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-username">Nom d'utilisateur / Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="user-username"
                      type="text"
                      placeholder="votre@email.com"
                      className="pl-10"
                      value={userForm.username}
                      onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Problème de connexion ?</p>
            <Button variant="link" className="text-xs">
              Contacter l'administrateur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};