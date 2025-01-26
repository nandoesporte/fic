import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial user
    const { data: { user: initialUser } } = supabase.auth.getUser();
    setUser(initialUser);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user };
};