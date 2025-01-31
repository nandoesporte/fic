import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      // First, get the questionnaire for the selected dimension
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .eq('dimension', selectedDimension)
        .single();

      if (questionnaireError) {
        console.error("Error fetching questionnaire:", questionnaireError);
        throw questionnaireError;
      }

      if (!questionnaire) {
        return {
          strengths: [],
          challenges: [],
          opportunities: []
        };
      }

      // Then get all votes for this questionnaire
      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*')
        .eq('questionnaire_id', questionnaire.id);

      if (votesError) {
        console.error("Error fetching votes:", votesError);
        throw votesError;
      }

      // Process votes into counters
      const voteCounters: Record<string, Record<string, number>> = {
        strengths: {},
        challenges: {},
        opportunities: {}
      };

      votes?.forEach(vote => {
        const { option_type, option_number } = vote;
        if (!voteCounters[option_type][option_number]) {
          voteCounters[option_type][option_number] = 0;
        }
        voteCounters[option_type][option_number]++;
      });

      // Format results with text content
      const formatResults = (type: 'strengths' | 'challenges' | 'opportunities') => {
        return Object.entries(voteCounters[type]).map(([optionNumber, total]) => {
          const options = questionnaire[type]?.split('\n\n') || [];
          const text = options[parseInt(optionNumber) - 1] || `Option ${optionNumber}`;
          return {
            optionNumber: String(optionNumber),
            total,
            text
          };
        }).sort((a, b) => b.total - a.total); // Sort by total votes in descending order
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