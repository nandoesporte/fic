import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuestionnaireVotes } from "./useQuestionnaireVotes";

interface Dimension {
  id: string;
  label: string;
  identifier: string;
  created_at: string;
  updated_at: string;
  background_color: string;
}

interface RegisteredVoter {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export const useAnalyticsData = (selectedDimension: string) => {
  const { data: dimensions } = useQuery<Dimension[]>({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) {
        throw error;
      }
      return data;
    },
  });

  const { data: registeredVoters } = useQuery<RegisteredVoter[]>({
    queryKey: ['registered-voters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registered_voters')
        .select('*');

      if (error) {
        throw error;
      }
      return data;
    },
  });

  const { data: votingData, isLoading } = useQuestionnaireVotes(selectedDimension);

  return {
    dimensions,
    registeredVoters,
    votingData,
    isLoading
  };
};