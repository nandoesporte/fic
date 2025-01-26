import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          
          if (!initialSession) {
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
          navigate('/login');
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
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}