import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      // Get questionnaires based on dimension
      const { data: questionnaires, error: questionnaireError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .eq('dimension', selectedDimension === 'all' ? undefined : selectedDimension);

      if (questionnaireError) {
        console.error("Error fetching questionnaires:", questionnaireError);
        throw questionnaireError;
      }

      if (!questionnaires || questionnaires.length === 0) {
        console.log("No questionnaires found for dimension:", selectedDimension);
        return {
          strengths: [],
          challenges: [],
          opportunities: []
        };
      }

      // Get all questionnaire IDs
      const questionnaireIds = questionnaires.map(q => q.id);

      // Get votes for all questionnaires
      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*')
        .in('questionnaire_id', questionnaireIds);

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

      // Get the first questionnaire for text content (or combine them if needed)
      const questionnaire = questionnaires[0];

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