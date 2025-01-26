import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/voting', '/formulario', '/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // Initialize session
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching initial session:", error);
          return;
        }

        if (mounted) {
          console.log("Initial session:", initialSession);
          setSession(initialSession);
          
          // Only redirect to login if not on a public route
          if (!initialSession && !PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error("Error in session initialization:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession);
      
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_IN':
          setSession(currentSession);
          navigate('/');
          break;
        case 'SIGNED_OUT':
          setSession(null);
          // Only redirect to login if not on a public route
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
          }
          break;
        case 'TOKEN_REFRESHED':
          setSession(currentSession);
          break;
        case 'USER_UPDATED':
          setSession(currentSession);
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