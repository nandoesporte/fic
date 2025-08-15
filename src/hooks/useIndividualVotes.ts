import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { splitOptions } from "@/lib/splitOptions";

interface IndividualVote {
  id: string;
  email: string;
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  vote_type: string;
  created_at: string;
  dimension: string;
  option_text: string;
}

export const useIndividualVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["individual-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching individual votes for dimension:", selectedDimension);
      
      // Get all votes with questionnaire information
      let query = supabase
        .from("questionnaire_votes")
        .select(`
          id,
          email,
          questionnaire_id,
          option_type,
          option_number,
          vote_type,
          created_at,
          fic_questionnaires (
            dimension,
            strengths,
            challenges,
            opportunities
          )
        `)
        .eq("vote_type", "upvote")
        .order("created_at", { ascending: false });

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching individual votes:", error);
        throw error;
      }

      if (!votes) return { strengths: [], challenges: [], opportunities: [] };

      // Process votes to get option text and filter by dimension
      const processedVotes: IndividualVote[] = votes
        .filter(vote => {
          const questionnaire = vote.fic_questionnaires;
          if (!questionnaire) return false;
          
          if (selectedDimension !== "all") {
            return questionnaire.dimension === selectedDimension;
          }
          return true;
        })
        .map(vote => {
          const questionnaire = vote.fic_questionnaires;
          let optionText = "";
          
          if (questionnaire) {
            const field = vote.option_type as 'strengths' | 'challenges' | 'opportunities';
            const options = splitOptions(questionnaire[field] || "");
            optionText = options[vote.option_number - 1] || "";
          }
          
          return {
            id: vote.id,
            email: vote.email,
            questionnaire_id: vote.questionnaire_id,
            option_type: vote.option_type,
            option_number: vote.option_number,
            vote_type: vote.vote_type,
            created_at: vote.created_at,
            dimension: questionnaire?.dimension || "",
            option_text: optionText
          };
        });

      // Separate votes by category
      const categorizedVotes = {
        strengths: processedVotes.filter(vote => vote.option_type === 'strengths'),
        challenges: processedVotes.filter(vote => vote.option_type === 'challenges'),
        opportunities: processedVotes.filter(vote => vote.option_type === 'opportunities')
      };

      console.log("Individual votes processed:", categorizedVotes);
      return categorizedVotes;
    },
  });
};