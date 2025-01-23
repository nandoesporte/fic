import { useState } from "react";
import { useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

export const useQuestionnaireVoting = (session: any) => {
  const [selections, setSelections] = useState<VoteSelection>({});
  const queryClient = useQueryClient();

  const submitVotesMutation = useMutation({
    mutationFn: async ({ questionnaireId, votes }: { 
      questionnaireId: string;
      votes: {
        optionType: string;
        optionNumbers: number[];
      }[];
    }) => {
      if (!session?.user?.id) {
        throw new Error('Você precisa estar autenticado para votar');
      }

      const { data: questionnaires } = await queryClient.getQueryData(['questionnaires']) as UseQueryResult<any>;
      const consolidatedQuestionnaire = questionnaires?.find((q: any) => q.id === questionnaireId);
      if (!consolidatedQuestionnaire) throw new Error('Questionário não encontrado');

      const votePromises = consolidatedQuestionnaire.questionnaire_ids.flatMap(originalQuestionnaireId =>
        votes.flatMap(({ optionType, optionNumbers }) =>
          optionNumbers.map(optionNumber =>
            supabase
              .from('questionnaire_votes')
              .insert({
                questionnaire_id: originalQuestionnaireId,
                user_id: session.user.id,
                vote_type: 'upvote',
                option_type: optionType,
                option_number: optionNumber,
              })
          )
        )
      );

      await Promise.all(votePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      queryClient.invalidateQueries({ queryKey: ['questionnaire-votes'] });
      toast.success('Votos registrados com sucesso!');
      setSelections({});
    },
    onError: (error) => {
      console.error('Error submitting votes:', error);
      toast.error('Erro ao registrar votos: ' + error.message);
    },
  });

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    const currentSelections = selections[questionnaireId]?.[optionType] || [];
    const isSelected = currentSelections.includes(optionNumber);

    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: currentSelections.filter(num => num !== optionNumber)
        }
      }));
    } else {
      if (currentSelections.length >= 3) {
        toast.error('Você já selecionou 3 opções nesta seção. Remova uma seleção para escolher outra.');
        return;
      }

      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: [...currentSelections, optionNumber]
        }
      }));
    }
  };

  const handleConfirmVotes = async (questionnaireId: string) => {
    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return;

    const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
      optionType,
      optionNumbers,
    }));

    await submitVotesMutation.mutate({ questionnaireId, votes });
  };

  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  return {
    selections,
    handleVote,
    handleConfirmVotes,
    isOptionSelected,
    getSelectionCount,
  };
};