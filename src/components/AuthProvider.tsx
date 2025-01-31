import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/voting', '/formulario', '/login', '/vote-success'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleAuthError = (error: AuthError | Error) => {
    console.error("Auth error:", error);
    setSession(null);

    let errorMessage = "Por favor, faça login novamente.";
    if (error instanceof Error) {
      if (error.message.includes("invalid_credentials")) {
        errorMessage = "Credenciais inválidas. Por favor, verifique seu email e senha.";
      } else if (error.message.includes("refresh_token_not_found")) {
        errorMessage = "Sua sessão expirou. Por favor, faça login novamente.";
      }
    }

    if (!PUBLIC_ROUTES.includes(location.pathname)) {
      navigate('/login');
    }

    toast({
      variant: "destructive",
      title: "Erro de autenticação",
      description: errorMessage,
    });
  };

  const handleTokenRefreshError = async () => {
    console.log("Token refresh failed, signing out...");
    try {
      await supabase.auth.signOut();
      setSession(null);
      if (!PUBLIC_ROUTES.includes(location.pathname)) {
        navigate('/login');
      }
      toast({
        variant: "destructive",
        title: "Sessão expirada",
        description: "Por favor, faça login novamente.",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize session
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session initialization error:", error);
          handleAuthError(error);
          return;
        }

        if (mounted) {
          setSession(initialSession);
          
          // Only redirect to login if not on a public route and no session exists
          if (!initialSession && !PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error("Error in session initialization:", error);
        handleAuthError(error as Error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, currentSession);
      
      switch (event) {
        case 'TOKEN_REFRESHED':
          if (currentSession) {
            setSession(currentSession);
          } else {
            await handleTokenRefreshError();
          }
          break;
        case 'SIGNED_IN':
          setSession(currentSession);
          if (location.pathname === '/login') {
            navigate('/');
          }
          break;
        case 'SIGNED_OUT':
        case 'USER_DELETED':
          setSession(null);
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
          }
          break;
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}