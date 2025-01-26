import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      // First, get all questionnaires with their votes
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

      console.log("Raw votes data:", votes);

      // Initialize vote counters for each category
      const voteCounters: Record<string, Record<string, number>> = {
        strengths: {},
        challenges: {},
        opportunities: {}
      };

      // Count votes for each option
      votes?.forEach(vote => {
        const { option_type, option_number } = vote;
        
        if (!voteCounters[option_type][option_number]) {
          voteCounters[option_type][option_number] = 0;
        }
        
        voteCounters[option_type][option_number]++;
      });

      console.log("Vote counters:", voteCounters);

      // Get the text content for each option from the first questionnaire
      const sampleQuestionnaire = votes?.[0]?.fic_questionnaires;
      
      // Format results with text content
      const formatResults = (type: 'strengths' | 'challenges' | 'opportunities') => {
        return Object.entries(voteCounters[type]).map(([optionNumber, total]) => {
          const options = sampleQuestionnaire?.[type]?.split('\n\n') || [];
          return {
            optionNumber: String(optionNumber),
            total,
            text: options[parseInt(optionNumber) - 1] || `Option ${optionNumber}`
          };
        });
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