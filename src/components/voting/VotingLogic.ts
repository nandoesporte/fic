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
  console.log('Submitting votes:', { questionnaireId, votes, dimension });

  try {
    // First check if user has already voted on this dimension
    const { data: existingVote, error: checkError } = await supabase
      .from('dimension_votes')
      .select('*')
      .eq('email', userEmail)
      .eq('dimension', dimension)
      .maybeSingle();

    if (existingVote) {
      throw new Error('Você já votou nesta dimensão. Cada pessoa pode votar apenas uma vez por dimensão.');
    }

    if (checkError) {
      console.error('Error checking existing votes:', checkError);
      throw new Error('Erro ao verificar votos existentes');
    }

    // If no existing vote, proceed with vote submission
    const { error: voteError } = await supabase.rpc('register_votes', {
      p_questionnaire_id: questionnaireId,
      p_email: userEmail,
      p_votes: votes
    });

    if (voteError) {
      console.error('Error submitting vote:', voteError);
      if (voteError.message.includes('já votou nesta dimensão')) {
        throw new Error('Você já votou nesta dimensão. Cada pessoa pode votar apenas uma vez por dimensão.');
      }
      throw new Error(`Erro ao registrar voto: ${voteError.message}`);
    }

    // Register dimension vote
    const { error: dimensionVoteError } = await supabase
      .from('dimension_votes')
      .insert({
        email: userEmail,
        dimension: dimension
      });

    if (dimensionVoteError) {
      console.error('Error registering dimension vote:', dimensionVoteError);
      throw dimensionVoteError;
    }

    toast.success('Votos registrados com sucesso!');
  } catch (error: any) {
    console.error('Error submitting votes:', error);
    
    // Check if it's our known "already voted" error
    if (error.message.includes('já votou nesta dimensão')) {
      toast.error('Você já votou nesta dimensão. Cada pessoa pode votar apenas uma vez por dimensão.');
    } else {
      toast.error(`Erro ao registrar votos: ${error.message}`);
    }
    
    throw error;
  }
};