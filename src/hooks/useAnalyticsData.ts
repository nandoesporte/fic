import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        console.error('Error fetching dimensions:', error);
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
        console.error('Error fetching registered voters:', error);
        throw error;
      }
      return data;
    },
  });

  const { data: votingData, isLoading } = useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      try {
        let query = supabase
          .from('questionnaire_voting_report')
          .select('*');
        
        if (selectedDimension !== "all") {
          query = query.eq('dimension', selectedDimension);
        }

        const { data: votingReport, error } = await query;

        if (error) {
          console.error("Error fetching voting report:", error);
          throw error;
        }

        // Process the voting report into the expected format
        const processedData = {
          strengths: votingReport?.filter(item => item.option_type === 'strengths').map(item => ({
            optionNumber: String(item.option_number),
            total: Number(item.total_votes),
            text: item.strengths || ''
          })) || [],
          challenges: votingReport?.filter(item => item.option_type === 'challenges').map(item => ({
            optionNumber: String(item.option_number),
            total: Number(item.total_votes),
            text: item.challenges || ''
          })) || [],
          opportunities: votingReport?.filter(item => item.option_type === 'opportunities').map(item => ({
            optionNumber: String(item.option_number),
            total: Number(item.total_votes),
            text: item.opportunities || ''
          })) || []
        };

        console.log("Processed vote data:", processedData);
        return processedData;
      } catch (error) {
        console.error("Error in useAnalyticsData:", error);
        throw error;
      }
    },
  });

  return {
    dimensions,
    registeredVoters,
    votingData,
    isLoading
  };
};