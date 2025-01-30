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
    // Check if user has already voted on this dimension first
    const { data: existingDimensionVote } = await supabase
      .from('dimension_votes')
      .select('id')
      .eq('email', userEmail.toLowerCase())
      .eq('dimension', dimension)
      .maybeSingle();

    if (existingDimensionVote) {
      throw new Error('Você já votou nesta dimensão. Cada pessoa pode votar apenas uma vez por dimensão.');
    }

    // Get questionnaire to validate options
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('fic_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (questionnaireError || !questionnaire) {
      throw new Error('Questionário não encontrado');
    }

    // Register dimension vote first
    const { error: dimensionVoteError } = await supabase
      .from('dimension_votes')
      .insert({
        email: userEmail.toLowerCase(),
        dimension: dimension
      });

    if (dimensionVoteError) {
      throw dimensionVoteError;
    }

    // Register individual votes
    for (const { optionType, optionNumbers } of votes) {
      for (const optionNumber of optionNumbers) {
        try {
          // Validate option number before inserting
          const { data: isValid, error: validationError } = await supabase
            .rpc('check_vote_eligibility', {
              p_questionnaire_id: questionnaireId,
              p_option_type: optionType,
              p_option_number: optionNumber,
              p_email: userEmail.toLowerCase()
            });

          if (validationError) {
            console.error('Validation error:', validationError);
            // If it's the "already voted" error, throw a more user-friendly message
            if (validationError.message.includes('já votou')) {
              throw new Error('Você já registrou seus votos para esta dimensão. Cada pessoa pode votar apenas uma vez por dimensão.');
            }
            throw new Error(`Erro ao validar voto: ${validationError.message}`);
          }

          if (!isValid) {
            console.error('Invalid vote:', { optionType, optionNumber });
            throw new Error(`Voto inválido para ${optionType} opção ${optionNumber}`);
          }

          // Insert vote if validation passed
          const { error: voteError } = await supabase
            .from('questionnaire_votes')
            .insert({
              questionnaire_id: questionnaireId,
              vote_type: 'upvote',
              option_type: optionType,
              option_number: optionNumber,
              email: userEmail.toLowerCase()
            });

          if (voteError) {
            if (voteError.code === '23505') {
              console.error('Duplicate vote:', voteError);
              throw new Error('Esta opção já foi votada');
            }
            throw voteError;
          }
        } catch (error: any) {
          // If it's our custom error for already voted, throw it up
          if (error.message.includes('já votou')) {
            throw error;
          }
          console.error('Error submitting vote:', error);
          throw new Error(`Erro ao registrar voto: ${error.message}`);
        }
      }
    }

    // Update questionnaire status
    const { error: updateError } = await supabase
      .from('fic_questionnaires')
      .update({ status: 'voted' })
      .eq('id', questionnaireId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error: any) {
    console.error('Error submitting votes:', error);
    // If it's our custom error message, throw it directly
    if (error.message.includes('já votou')) {
      throw error;
    }
    throw new Error(error.message || 'Erro ao registrar votos');
  }
};