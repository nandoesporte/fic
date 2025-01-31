import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      // First, get all votes with their corresponding questionnaire data
      let query = supabase
        .from('questionnaire_votes')
        .select(`
          id,
          questionnaire_id,
          vote_type,
          option_type,
          option_number,
          fic_questionnaires!inner (
            dimension,
            strengths,
            challenges,
            opportunities
          )
        `);

      // Apply dimension filter if not "all"
      if (selectedDimension !== "all") {
        query = query.eq('fic_questionnaires.dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        throw error;
      }

      // Initialize vote counters
      const voteCounters: Record<string, Record<number, number>> = {
        strengths: {},
        challenges: {},
        opportunities: {}
      };

      // Process votes
      votes?.forEach(vote => {
        const questionnaire = vote.fic_questionnaires;
        if (!questionnaire) return;

        const { option_type, option_number } = vote;
        
        if (!voteCounters[option_type]) {
          voteCounters[option_type] = {};
        }
        
        if (!voteCounters[option_type][option_number]) {
          voteCounters[option_type][option_number] = 0;
        }
        
        voteCounters[option_type][option_number]++;
      });

      // Get the text content for each option from any questionnaire (they should all have the same content)
      const sampleQuestionnaire = votes?.[0]?.fic_questionnaires;
      
      // Format results
      const formatResults = (type: 'strengths' | 'challenges' | 'opportunities') => {
        const options = sampleQuestionnaire?.[type]?.split('\n\n') || [];
        return Object.entries(voteCounters[type]).map(([optionNumber, total]) => ({
          optionNumber: String(optionNumber),
          total,
          text: options[parseInt(optionNumber) - 1] || ""
        }));
      };

      const results = {
        strengths: formatResults('strengths'),
        challenges: formatResults('challenges'),
        opportunities: formatResults('opportunities')
      };

      console.log("Processed vote data:", results);
      return results;
    },
  });
};