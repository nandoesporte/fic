import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      let query = supabase
        .from("questionnaire_votes")
        .select(`
          questionnaire_id,
          option_type,
          option_number,
          vote_type,
          fic_questionnaires (
            dimension,
            satisfaction,
            strengths,
            challenges,
            opportunities
          )
        `);

      if (selectedDimension && selectedDimension !== "all") {
        query = query.eq('fic_questionnaires.dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        throw error;
      }

      console.log("Raw vote data:", votes);

      // If no votes found, return empty array
      if (!votes || votes.length === 0) {
        return [];
      }

      const processedVotes = votes?.reduce((acc: any[], vote) => {
        const key = `${vote.questionnaire_id}-${vote.option_type}-${vote.option_number}`;
        const existingVote = acc.find(v => 
          v.questionnaire_id === vote.questionnaire_id && 
          v.option_type === vote.option_type && 
          v.option_number === vote.option_number
        );

        if (existingVote) {
          existingVote.upvotes = (existingVote.upvotes || 0) + (vote.vote_type === 'upvote' ? 1 : 0);
          existingVote.downvotes = (existingVote.downvotes || 0) + (vote.vote_type === 'downvote' ? 1 : 0);
        } else {
          const options = vote.option_type === "strengths" 
            ? vote.fic_questionnaires?.strengths
            : vote.option_type === "challenges"
              ? vote.fic_questionnaires?.challenges
              : vote.fic_questionnaires?.opportunities;
          
          const optionsList = options?.split('\n\n').filter(Boolean) || [];
          const optionText = optionsList[vote.option_number - 1] || "";

          acc.push({
            questionnaire_id: vote.questionnaire_id,
            option_type: vote.option_type,
            option_number: vote.option_number,
            upvotes: vote.vote_type === 'upvote' ? 1 : 0,
            downvotes: vote.vote_type === 'downvote' ? 1 : 0,
            dimension: vote.fic_questionnaires?.dimension,
            option_text: optionText,
          });
        }

        return acc;
      }, []);

      console.log("Processed vote data:", processedVotes);
      return processedVotes;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};