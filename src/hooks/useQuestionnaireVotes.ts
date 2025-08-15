
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

      // Store individual votes without aggregating
      const individualVotes: Record<string, Array<{ text: string; questionnaireId: string; optionNumber: number }>> = {
        strengths: [],
        challenges: [],
        opportunities: []
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

          // Store each individual vote
          votes.forEach(vote => {
            const optionNumber = vote.option_number;
            const text = optionsArray[optionNumber - 1] || "";
            
            if (text.trim()) {
              individualVotes[optionType].push({
                text: text.trim(),
                questionnaireId: questionnaire.id,
                optionNumber
              });
              
              console.log(`Added individual vote for ${optionType}: "${text}"`);
            }
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

      console.log("Individual votes:", individualVotes);

      // Format final results - show each individual vote with its text
      const formatResults = (category: string) => {
        const categoryVotes = individualVotes[category];
        
        // Count occurrences of each unique text
        const textCounts = new Map<string, number>();
        categoryVotes.forEach(vote => {
          const count = textCounts.get(vote.text) || 0;
          textCounts.set(vote.text, count + 1);
        });
        
        // Convert to results array
        const results: Array<{ optionNumber: string; total: number; text: string }> = [];
        textCounts.forEach((count, text) => {
          // Find the first occurrence to get the option number
          const firstOccurrence = categoryVotes.find(vote => vote.text === text);
          results.push({
            optionNumber: String(firstOccurrence?.optionNumber || 1),
            total: count,
            text
          });
        });
        
        // Sort by total votes descending
        return results.sort((a, b) => b.total - a.total);
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
