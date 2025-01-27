import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { VotingSection } from "@/components/voting/VotingSection";

type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

export const QuestionnaireVoting = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selections, setSelections] = useState<VoteSelection>({});
  const queryClient = useQueryClient();

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['active-questionnaires'],
    queryFn: async () => {
      console.log('Fetching active questionnaires...');
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (questionnairesError) {
        console.error('Error fetching questionnaires:', questionnairesError);
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      return questionnairesData?.reduce((acc: any[], curr) => {
        const existingDimension = acc.find(q => q.dimension === curr.dimension);
        if (!existingDimension) {
          acc.push(curr);
        }
        return acc;
      }, []) || [];
    },
    enabled: isEmailVerified,
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

      // Start a batch operation
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
      votes.forEach(({ optionType, optionNumbers }) => {
        optionNumbers.forEach(optionNumber => {
          votePromises.push(
            supabase
              .from('questionnaire_votes')
              .insert({
                questionnaire_id: questionnaireId,
                vote_type: 'upvote',
                option_type: optionType,
                option_number: optionNumber,
              })
          );
        });
      });

      // Execute all promises
      const results = await Promise.all(votePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors submitting votes:', errors);
        throw new Error('Erro ao registrar alguns votos');
      }

      // Update questionnaire status after successful vote submission
      const { error: updateError } = await supabase
        .from('fic_questionnaires')
        .update({ status: 'voted' })
        .eq('id', questionnaireId);

      if (updateError) {
        console.error('Error updating questionnaire status:', updateError);
        throw updateError;
      }

      console.log('All votes submitted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-questionnaires'] });
      toast.success('Votos registrados com sucesso!');
      setSelections({});
      navigate('/vote-success');
    },
    onError: (error: Error) => {
      console.error('Error in vote submission:', error);
      toast.error(`Erro ao registrar votos: ${error.message}`);
    },
  });

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email para votar');
      return;
    }

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
      }

      if (currentSelections.length >= 3) {
        toast.error('Você já selecionou 3 opções nesta seção');
        return prev;
      }

      return {
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: [...currentSelections, optionNumber]
        }
      };
    });
  };

  const handleConfirmVotes = async (questionnaireId: string) => {
    const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
    if (!questionnaire) {
      toast.error('Questionário não encontrado');
      return;
    }

    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) {
      toast.error('Nenhuma seleção encontrada');
      return;
    }

    const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
      optionType,
      optionNumbers,
    }));

    try {
      await submitVotesMutation.mutateAsync({ 
        questionnaireId, 
        votes,
        dimension: questionnaire.dimension 
      });
    } catch (error) {
      console.error('Error confirming votes:', error);
    }
  };

  const handleEmailVerified = (email: string) => {
    setUserEmail(email);
    setIsEmailVerified(true);
  };

  if (!isEmailVerified) {
    return <EmailVerification onVerified={handleEmailVerified} />;
  }

  return (
    <VotingSection
      userEmail={userEmail}
      questionnaires={questionnaires || []}
      isLoading={isLoading}
      selections={selections}
      onVote={handleVote}
      onConfirmVotes={handleConfirmVotes}
    />
  );
};

export default QuestionnaireVoting;