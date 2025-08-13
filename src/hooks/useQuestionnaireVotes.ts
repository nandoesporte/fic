import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { splitOptions } from "@/lib/splitOptions";


const getTextForOption = (
  qs: any[] | null,
  field: 'strengths' | 'challenges' | 'opportunities',
  optionIndex: number
): string => {
  if (!qs) return "";
  for (const q of qs) {
    const arr = splitOptions(q?.[field] || "");
    if (arr[optionIndex]) return arr[optionIndex];
  }
  return "";
};

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      // First, get all questionnaires for the selected dimension
      let query = supabase
        .from("fic_questionnaires")
        .select(`
          id,
          dimension,
          strengths,
          challenges,
          opportunities,
          questionnaire_votes (
            option_type,
            option_number,
            vote_type
          )
        `);

      if (selectedDimension !== "all") {
        query = query.eq("dimension", selectedDimension);
      }

      const { data: questionnaires, error: questionnairesError } = await query;

      if (questionnairesError) {
        console.error("Error fetching questionnaires:", questionnairesError);
        throw questionnairesError;
      }

      // Initialize vote counters
      const voteCounters: Record<string, Record<number, number>> = {
        strengths: {},
        challenges: {},
        opportunities: {}
      };

      // Process each questionnaire and its votes
      questionnaires?.forEach(questionnaire => {
        const processVotes = (optionType: string, options: string) => {
          const optionsArray = splitOptions(options);
          
          // Get votes for this questionnaire and option type
          const votes = questionnaire.questionnaire_votes?.filter(
            vote => vote.option_type === optionType && vote.vote_type === 'upvote'
          ) || [];

          // Count votes for each option
          votes.forEach(vote => {
            if (!voteCounters[optionType][vote.option_number]) {
              voteCounters[optionType][vote.option_number] = 0;
            }
            voteCounters[optionType][vote.option_number]++;
          });

          // Return formatted results
          return Object.entries(voteCounters[optionType]).map(([optionNumber, total]) => ({
            optionNumber: optionNumber,
            total,
            text: optionsArray[parseInt(optionNumber) - 1] || ""
          }));
        };

        // Process votes for each category
        if (questionnaire.strengths) {
          processVotes('strengths', questionnaire.strengths);
        }
        if (questionnaire.challenges) {
          processVotes('challenges', questionnaire.challenges);
        }
        if (questionnaire.opportunities) {
          processVotes('opportunities', questionnaire.opportunities);
        }
      });

      // Format final results
      const results = {
        strengths: Object.entries(voteCounters.strengths).map(([optionNumber, total]) => ({
          optionNumber: String(optionNumber),
          total,
          text: getTextForOption(questionnaires || [], 'strengths', parseInt(String(optionNumber)) - 1) || ""
        })),
        challenges: Object.entries(voteCounters.challenges).map(([optionNumber, total]) => ({
          optionNumber: String(optionNumber),
          total,
          text: getTextForOption(questionnaires || [], 'challenges', parseInt(String(optionNumber)) - 1) || ""
        })),
        opportunities: Object.entries(voteCounters.opportunities).map(([optionNumber, total]) => ({
          optionNumber: String(optionNumber),
          total,
          text: getTextForOption(questionnaires || [], 'opportunities', parseInt(String(optionNumber)) - 1) || ""
        }))
      };

      console.log("Processed vote data:", results);
      return results;
    },
  });
};
