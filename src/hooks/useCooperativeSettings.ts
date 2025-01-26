import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CooperativeData = {
  name: string;
  members: number;
  engagement: number;
};

type ProfileData = {
  id: string;
  email: string;
  steps: number;
  coins: number;
  created_at: string;
  updated_at: string;
  cpf: string;
  name: string;
  weight: number;
  height: number;
  birth_date: string;
  gender: string;
  fitness_level: string;
  cocamarmembers: string;
  cocamarengagement: string;
  sicoobmembers: string;
  sicoobengagement: string;
  frisiamembers: string;
  frisiaengagement: string;
  cocamarname: string;
  sicoobname: string;
  frisianame: string;
};

export const useCooperativeSettings = () => {
  const [cooperatives, setCooperatives] = useState<CooperativeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
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
  }, []);

  return { cooperatives, loading, refetch: fetchSettings };
};