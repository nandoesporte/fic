import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      let query = supabase
        .from("questionnaire_voting_report")
        .select("*")
        .order('total_votes', { ascending: false });

      if (selectedDimension && selectedDimension !== "all") {
        query = query.eq('dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        throw error;
      }

      console.log("Raw vote data:", votes);

      // Group votes by type and process them
      const processedVotes = votes?.reduce((acc: any, vote) => {
        const type = vote.option_type;
        if (!acc[type]) {
          acc[type] = [];
        }

        // Get the correct text based on the option type
        const optionText = vote[type]?.split('\n\n')[vote.option_number - 1] || "";

        // Check if we already have this option
        const existingOption = acc[type].find((v: any) => 
          v.optionNumber === String(vote.option_number) && 
          v.text === optionText
        );

        if (existingOption) {
          existingOption.total = vote.total_votes;
        } else {
          acc[type].push({
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