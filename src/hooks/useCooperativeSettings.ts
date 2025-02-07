
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export type CooperativeData = {
  name: string;
  members: number;
  engagement: number;
};

type ProfileData = {
  cocamarengagement: string | null;
  cocamarmembers: string | null;
  cocamarname: string | null;
  company_description: string | null;
  company_logo: string | null;
  company_name: string | null;
  created_at: string | null;
  email: string;
  frisiaengagement: string | null;
  frisiamembers: string | null;
  frisianame: string | null;
  id: string;
  sicoobengagement: string | null;
  sicoobmembers: string | null;
  sicoobname: string | null;
  updated_at: string | null;
  welcome_description: string | null;
  welcome_message: string | null;
};

export const useCooperativeSettings = () => {
  const [cooperatives, setCooperatives] = useState<CooperativeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchSettings = async () => {
    try {
      // Only fetch if we have an authenticated user
      if (!session?.user?.id) {
        setCooperatives([
          { 
            name: "Cocamar", 
            members: 15800, 
            engagement: 88 
          },
          { 
            name: "Sicoob", 
            members: 25300, 
            engagement: 92 
          },
          { 
            name: "Frísia", 
            members: 12400, 
            engagement: 85 
          }
        ]);
        setLoading(false);
        return;
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cooperative settings:', error);
        return;
      }

      if (profiles) {
        const profileData = profiles as ProfileData;
        setCooperatives([
          { 
            name: profileData.cocamarname || "Cocamar", 
            members: parseInt(profileData.cocamarmembers || "15800"), 
            engagement: parseInt(profileData.cocamarengagement || "88") 
          },
          { 
            name: profileData.sicoobname || "Sicoob", 
            members: parseInt(profileData.sicoobmembers || "25300"), 
            engagement: parseInt(profileData.sicoobengagement || "92") 
          },
          { 
            name: profileData.frisianame || "Frísia", 
            members: parseInt(profileData.frisiamembers || "12400"), 
            engagement: parseInt(profileData.frisiaengagement || "85") 
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching cooperative settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [session?.user?.id]); // Re-fetch when user ID changes

  return { cooperatives, loading, refetch: fetchSettings };
};
