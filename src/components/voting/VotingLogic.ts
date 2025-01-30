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

  // Check if user has already voted on this dimension
  const { data: existingVote } = await supabase
    .from('dimension_votes')
    .select('id')
    .eq('email', userEmail.toLowerCase())
    .eq('dimension', dimension)
    .maybeSingle();

  if (existingVote) {
    throw new Error('Você já votou nesta dimensão');
  }

  // Prepare all vote operations
  const votePromises = [];

  // Register dimension vote
  votePromises.push(
    supabase
      .from('dimension_votes')
      .insert({
        email: userEmail.toLowerCase(),
        dimension: dimension
      })
  );

  // Register individual votes
  for (const { optionType, optionNumbers } of votes) {
    for (const optionNumber of optionNumbers) {
      // Check if vote already exists
      const { data: existingVote } = await supabase
        .from('questionnaire_votes')
        .select('id')
        .eq('questionnaire_id', questionnaireId)
        .eq('email', userEmail.toLowerCase())
        .eq('option_type', optionType)
        .eq('option_number', optionNumber)
        .maybeSingle();

      if (!existingVote) {
        votePromises.push(
          supabase
            .from('questionnaire_votes')
            .insert({
              questionnaire_id: questionnaireId,
              vote_type: 'upvote',
              option_type: optionType,
              option_number: optionNumber,
              email: userEmail.toLowerCase()
            })
        );
      }
    }
  }

  // Execute all promises
  const results = await Promise.all(votePromises);
  
  // Check for errors
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    console.error('Errors submitting votes:', errors);
    throw new Error('Erro ao registrar alguns votos');
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
};