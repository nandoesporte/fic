import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      let query = supabase
        .from("questionnaire_voting_report")
        .select("*");

      if (selectedDimension !== "all") {
        query = query.eq("dimension", selectedDimension);
      }

      const { data: votingReport, error } = await query;

      if (error) {
        console.error("Error fetching voting report:", error);
        throw error;
      }

      // Process the votes into the expected format
      const processedVotes = votingReport?.reduce((acc: any, vote) => {
        if (!acc[vote.option_type]) {
          acc[vote.option_type] = [];
        }

        // Get the text based on option type
        const options = vote[vote.option_type]?.split('\n\n') || [];
        const optionText = options[vote.option_number - 1] || "";

        // Add or update the vote count
        const existingVote = acc[vote.option_type].find((v: any) => 
          v.optionNumber === String(vote.option_number) &&
          v.text === optionText
        );

        if (existingVote) {
          existingVote.total = vote.total_votes;
        } else {
          acc[vote.option_type].push({
            optionNumber: String(vote.option_number),
            total: vote.total_votes,
            text: optionText,
          });
        }

        return acc;
      }, { strengths: [], challenges: [], opportunities: [] });

      console.log("Processed vote data:", processedVotes);
      return processedVotes;
    },
  });
};