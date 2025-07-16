
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // Se já estiver logado, redirecionar para dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      // Redirecionar para a página solicitada ou dashboard
      const destination = (from && from !== "/" && from !== "/login") ? from : "/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Erro no login",
          description: "Por favor, preencha todos os campos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await login(email, password);

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao VextriaHub",
        });

        // Redirecionar para a página solicitada ou dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center text-primary">
              <span className="text-2xl font-bold">VextriaHub</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Assistente Jurídico Inteligente
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground"
                  onClick={() => {
                    toast({
                      title: "Funcionalidade em breve",
                      description: "A recuperação de senha será implementada em breve",
                    });
                  }}
                >
                  Esqueceu sua senha?
                </Button>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary p-0 h-auto font-medium"
                    onClick={() => navigate("/cadastro")}
                  >
                    Cadastre-se grátis
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Seus dados estão protegidos</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 VextriaHub. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
