
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { votingToasts } from "@/components/voting/VotingToast";

export const useVoteSubmission = (userEmail: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ questionnaireId, votes, dimension }: { 
      questionnaireId: string;
      votes: {
        optionType: string;
        optionNumbers: number[];
      }[];
      dimension: string;
    }) => {
      if (!userEmail) {
        throw new Error('Email não fornecido');
      }

      // Verificar se já votou nesta dimensão
      const { data: existingVote } = await supabase
        .from('dimension_votes')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .eq('dimension', dimension)
        .maybeSingle();

      if (existingVote) {
        throw new Error('Você já votou nesta dimensão');
      }

      // Registrar o voto na dimensão
      await supabase
        .from('dimension_votes')
        .insert({
          email: userEmail.toLowerCase(),
          dimension: dimension
        });

      // Registrar os votos individuais
      const votePromises = votes.flatMap(({ optionType, optionNumbers }) =>
        optionNumbers.map(optionNumber =>
          supabase
            .from('questionnaire_votes')
            .insert({
              questionnaire_id: questionnaireId,
              email: userEmail.toLowerCase(),
              vote_type: 'upvote',
              option_type: optionType,
              option_number: optionNumber,
            })
        )
      );

      await Promise.all(votePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      queryClient.invalidateQueries({ queryKey: ['questionnaire-votes'] });
      votingToasts.votesSubmitted();
      navigate('/vote-success');
    },
    onError: (error) => {
      console.error('Error submitting votes:', error);
      votingToasts.error('Erro ao registrar votos', error.message);
    },
  });
};
