import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CooperativeData = {
  name: string;
  members: number;
  engagement: number;
};

export const useCooperativeSettings = () => {
  const [cooperatives, setCooperatives] = useState<CooperativeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (profiles) {
        setCooperatives([
          { 
            name: "Cocamar", 
            members: parseInt(profiles.cocamarMembers || "15800"), 
            engagement: parseInt(profiles.cocamarEngagement || "88") 
          },
          { 
            name: "Sicoob", 
            members: parseInt(profiles.sicoobMembers || "25300"), 
            engagement: parseInt(profiles.sicoobEngagement || "92") 
          },
          { 
            name: "Frísia", 
            members: parseInt(profiles.frisiaMembers || "12400"), 
            engagement: parseInt(profiles.frisiaEngagement || "85") 
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