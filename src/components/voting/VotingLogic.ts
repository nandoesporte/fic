import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const submitVotes = async ({
  questionnaireId,
  votes,
  dimension,
  userEmail,
}: {
  questionnaireId: string;
  votes: Array<{ optionType: string; optionNumbers: number[] }>;
  dimension: string;
  userEmail: string;
}) => {
  console.log('Submitting votes:', { questionnaireId, votes, dimension, userEmail });

  try {
    // Check if user has already voted on this dimension
    const { data: existingVote, error: checkError } = await supabase
      .from('dimension_votes')
      .select('id')
      .eq('email', userEmail.toLowerCase())
      .eq('dimension', dimension)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing votes:', checkError);
      throw new Error('Erro ao verificar votos existentes');
    }

    if (existingVote) {
      throw new Error('Você já votou nesta dimensão. Cada pessoa pode votar apenas uma vez por dimensão.');
    }

    // Delete any existing votes for this questionnaire (if any)
    const { error: deleteError } = await supabase
      .from('questionnaire_votes')
      .delete()
      .eq('questionnaire_id', questionnaireId);

    if (deleteError) {
      console.error('Error deleting existing votes:', deleteError);
      throw new Error('Erro ao limpar votos existentes');
    }

    // Register dimension vote
    const { error: dimensionVoteError } = await supabase
      .from('dimension_votes')
      .insert({
        email: userEmail.toLowerCase(),
        dimension: dimension
      });

    if (dimensionVoteError) {
      console.error('Error registering dimension vote:', dimensionVoteError);
      throw new Error('Erro ao registrar voto na dimensão');
    }

    // Submit all votes in sequence to avoid conflicts
    for (const { optionType, optionNumbers } of votes) {
      for (const optionNumber of optionNumbers) {
        const { error: voteError } = await supabase
          .from('questionnaire_votes')
          .insert({
            questionnaire_id: questionnaireId,
            vote_type: 'upvote',
            option_type: optionType,
            option_number: optionNumber,
          });

        if (voteError) {
          console.error('Error submitting vote:', voteError);
          throw new Error('Erro ao registrar voto');
        }
      }
    }

    // Update questionnaire status
    const { error: updateError } = await supabase
      .from('fic_questionnaires')
      .update({ status: 'voted' })
      .eq('id', questionnaireId);

    if (updateError) {
      console.error('Error updating questionnaire status:', updateError);
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error in submitVotes:', error);
    throw error;
  }
};