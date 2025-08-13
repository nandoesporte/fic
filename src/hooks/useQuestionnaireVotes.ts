
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

      console.log("Questionnaires found:", questionnaires?.length);
      console.log("Questionnaires data:", questionnaires);

      // Initialize vote counters - fix the structure to properly accumulate across questionnaires
      const voteCounters: Record<string, Record<number, { count: number, text: string }>> = {
        strengths: {},
        challenges: {},
        opportunities: {}
      };

      // Process each questionnaire and its votes
      questionnaires?.forEach(questionnaire => {
        console.log(`Processing questionnaire ${questionnaire.id} for dimension ${questionnaire.dimension}`);
        
        const processVotes = (optionType: string, options: string) => {
          const optionsArray = splitOptions(options);
          console.log(`${optionType} options:`, optionsArray);
          
          // Get votes for this questionnaire and option type
          const votes = questionnaire.questionnaire_votes?.filter(
            vote => vote.option_type === optionType && vote.vote_type === 'upvote'
          ) || [];

          console.log(`Votes for ${optionType}:`, votes);

          // Count votes for each option
          votes.forEach(vote => {
            const optionNumber = vote.option_number;
            const text = optionsArray[optionNumber - 1] || "";
            
            // Create a global key that combines text and option number to handle duplicates across questionnaires
            const globalKey = `${text}-${optionNumber}`;
            
            if (!voteCounters[optionType][optionNumber]) {
              voteCounters[optionType][optionNumber] = { count: 0, text };
            }
            voteCounters[optionType][optionNumber].count++;
            
            console.log(`Added vote for ${optionType} option ${optionNumber}: "${text}"`);
          });
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

      console.log("Final vote counters:", voteCounters);

      // Format final results - aggregate by text content, not just option number
      const aggregateByText = (category: string) => {
        const textMap = new Map<string, { total: number, optionNumber: string }>();
        
        Object.entries(voteCounters[category]).forEach(([optionNumber, data]) => {
          const text = data.text.trim();
          if (text) {
            if (textMap.has(text)) {
              textMap.get(text)!.total += data.count;
            } else {
              textMap.set(text, { total: data.count, optionNumber: String(optionNumber) });
            }
          }
        });
        
        return Array.from(textMap.entries()).map(([text, data]) => ({
          optionNumber: data.optionNumber,
          total: data.total,
          text
        }));
      };

      const results = {
        strengths: aggregateByText('strengths'),
        challenges: aggregateByText('challenges'),
        opportunities: aggregateByText('opportunities')
      };

      console.log("Processed vote data:", results);
      return results;
    },
  });
};
