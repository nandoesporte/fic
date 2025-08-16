import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
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
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Initialize session
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session initialization error:", error);
          if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
          return;
        }

        if (mounted) {
          setSession(initialSession);
          
          // Only redirect to login if not on a public route and no session exists
          if (!initialSession && !PUBLIC_ROUTES.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error("Error in session initialization:", error);
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Houve um problema ao inicializar sua sessão. Por favor, faça login novamente.",
        });
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
      
      if (event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
      } else if (event === 'SIGNED_IN') {
        setSession(currentSession);
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        // Only redirect to login if not on a public route
        if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}