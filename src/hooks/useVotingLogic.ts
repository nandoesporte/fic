import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { VoteSelections } from "@/types/voting";

export const useVotingLogic = () => {
  const [selections, setSelections] = useState<VoteSelections>({});
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      console.log('Fetching questionnaires data...');
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionnairesError) {
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      console.log('Questionnaires data fetched:', questionnairesData);
      
      const consolidatedQuestionnaires = questionnairesData.reduce((acc: { [key: string]: any }, curr: any) => {
        if (curr.status === 'active' && curr.group) {
          acc[curr.group] = curr;
        }
        return acc;
      }, {});

      return Object.values(consolidatedQuestionnaires);
    },
    enabled: true,
  });

  const submitVotesMutation = useMutation({
    mutationFn: async ({ questionnaireId, votes, dimension }: { 
      questionnaireId: string;
      votes: {
        optionType: string;
        optionNumbers: number[];
      }[];
      dimension: string;
    }) => {
      if (!session?.user?.id) {
        throw new Error('Usuário não está autenticado');
      }

      const { data: existingVote } = await supabase
        .from('dimension_votes')
        .select('id')
        .eq('email', session.user.email?.toLowerCase())
        .eq('dimension', dimension)
        .maybeSingle();

      if (existingVote) {
        throw new Error('Você já votou nesta dimensão');
      }

      const { error: dimensionVoteError } = await supabase
        .from('dimension_votes')
        .insert({
          email: session.user.email?.toLowerCase(),
          dimension: dimension
        });

      if (dimensionVoteError) throw dimensionVoteError;

      const votePromises = votes.flatMap(({ optionType, optionNumbers }) =>
        optionNumbers.map(optionNumber =>
          supabase
            .from('questionnaire_votes')
            .insert({
              questionnaire_id: questionnaireId,
              user_id: session.user.id,
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
      toast.success('Votos registrados com sucesso!');
      setSelections({});
    },
    onError: (error) => {
      console.error('Error submitting votes:', error);
      toast.error('Erro ao registrar votos: ' + error.message);
    },
  });

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    setSelections(prev => {
      const currentSelections = prev[questionnaireId]?.[optionType] || [];
      const isSelected = currentSelections.includes(optionNumber);

      if (isSelected) {
        return {
          ...prev,
          [questionnaireId]: {
            ...prev[questionnaireId],
            [optionType]: currentSelections.filter(num => num !== optionNumber)
          }
        };
      } else {
        if (currentSelections.length >= 3) {
          toast.error('Você já selecionou 3 opções nesta seção. Remova uma seleção para escolher outra.');
          return prev;
        }

        return {
          ...prev,
          [questionnaireId]: {
            ...prev[questionnaireId],
            [optionType]: [...currentSelections, optionNumber]
          }
        };
      }
    });
  };

  const handleConfirmVotes = async (questionnaireId: string) => {
    const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
    if (!questionnaire) return;

    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return;

    const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
      optionType,
      optionNumbers,
    }));

    await submitVotesMutation.mutate({ 
      questionnaireId, 
      votes,
      dimension: questionnaire.dimension 
    });
  };

  return {
    questionnaires,
    isLoading,
    selections,
    handleVote,
    handleConfirmVotes,
  };
};