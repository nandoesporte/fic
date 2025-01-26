import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      const { data: votingReport, error: viewError } = await supabase
        .from("questionnaire_voting_report")
        .select("*")
        .order('total_votes', { ascending: false });

      if (viewError) {
        console.error("Error fetching from view:", viewError);
        
        // Fallback to direct query if view is not accessible
        const { data: votes, error } = await supabase
          .from("questionnaire_votes")
          .select(`
            id,
            option_type,
            option_number,
            questionnaire_id,
            fic_questionnaires (
              dimension,
              group,
              strengths,
              challenges,
              opportunities
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching votes:", error);
          throw error;
        }

        // Process the votes to match the expected format
        const processedVotes = votes?.reduce((acc: any, vote) => {
          const questionnaire = vote.fic_questionnaires;
          if (!questionnaire) return acc;

          const type = vote.option_type;
          if (!acc[type]) {
            acc[type] = [];
          }

          // Get the correct text based on the option type
          const optionsText = questionnaire[type];
          if (!optionsText) return acc;

          const optionText = optionsText.split('\n\n')[vote.option_number - 1] || "";

          // Check if we already have this option
          const existingOption = acc[type].find((v: any) => 
            v.optionNumber === String(vote.option_number) && 
            v.text === optionText
          );

          if (existingOption) {
            existingOption.total += 1;
          } else {
            acc[type].push({
              optionNumber: String(vote.option_number),
              total: 1,
              text: optionText,
            });
          }

          return acc;
        }, { strengths: [], challenges: [], opportunities: [] });

        console.log("Processed vote data:", processedVotes);
        return processedVotes;
      }

      // If view query succeeded, process that data
      const processedVotes = votingReport?.reduce((acc: any, vote) => {
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

      console.log("Processed vote data from view:", processedVotes);
      return processedVotes;
    },
  });
};