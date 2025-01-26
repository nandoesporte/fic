import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      let query = supabase
        .from("questionnaire_voting_report")
        .select('*');

      if (selectedDimension && selectedDimension !== "all") {
        query = query.eq('dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        throw error;
      }

      console.log("Raw vote data:", votes);

      // Process votes to ensure no duplicates
      const processedVotes = votes?.reduce((acc: any[], vote) => {
        const key = `${vote.option_type}-${vote.option_number}`;
        const existingVote = acc.find(v => 
          v.option_type === vote.option_type && 
          v.option_number === vote.option_number
        );

        if (!existingVote) {
          const optionText = vote.option_type === "strengths" 
            ? vote.strengths
            : vote.option_type === "challenges"
              ? vote.challenges
              : vote.opportunities;

          acc.push({
            option_type: vote.option_type,
            option_number: vote.option_number,
            total: vote.total_votes || 0,
            option_text: optionText,
          });
        }

        return acc;
      }, []);

      console.log("Processed vote data:", processedVotes);
      return processedVotes;
    },
  });
};