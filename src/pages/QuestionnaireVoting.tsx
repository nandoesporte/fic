import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { VotingSection } from "@/components/voting/VotingSection";
import { ConfirmVoteButton } from "@/components/voting/ConfirmVoteButton";

interface Selections {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
}

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selections, setSelections] = useState<Selections>({});
  const queryClient = useQueryClient();

  const verifyEmail = async () => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email');
      return;
    }

    const { data, error } = await supabase
      .from('registered_voters')
      .select('id')
      .eq('email', userEmail.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error verifying email:', error);
      toast.error('Erro ao verificar email');
      return;
    }

    if (!data) {
      toast.error('Email não encontrado no sistema');
      return;
    }

    setIsEmailVerified(true);
    toast.success('Email verificado com sucesso!');
  };

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select(`
          *,
          questionnaire_vote_counts (
            option_type,
            option_number,
            upvotes,
            downvotes
          )
        `)
        .order('created_at', { ascending: false });

      if (questionnairesError) {
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      return questionnairesData;
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
      const hasVoted = await checkExistingVote(dimension);
      if (hasVoted) {
        throw new Error('Você já votou nesta dimensão');
      }

      const { data: userData } = await supabase
        .from('registered_voters')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .single();

      if (!userData) {
        throw new Error('Usuário não encontrado');
      }

      const votePromises = votes.flatMap(({ optionType, optionNumbers }) =>
        optionNumbers.map(optionNumber =>
          supabase
            .from('questionnaire_votes')
            .insert({
              questionnaire_id: questionnaireId,
              user_id: userData.id,
              vote_type: 'upvote',
              option_type: optionType,
              option_number: optionNumber,
            })
        )
      );

      await Promise.all(votePromises);

      const { error: dimensionVoteError } = await supabase
        .from('dimension_votes')
        .insert({
          email: userEmail.toLowerCase(),
          dimension: dimension
        });

      if (dimensionVoteError) throw dimensionVoteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Votos registrados com sucesso!');
      setSelections({});
    },
    onError: (error) => {
      console.error('Error submitting votes:', error);
      toast.error('Erro ao registrar votos: ' + error.message);
    },
  });

  const checkExistingVote = async (dimension: string) => {
    const { data: existingVote } = await supabase
      .from('dimension_votes')
      .select('id')
      .eq('email', userEmail.toLowerCase())
      .eq('dimension', dimension)
      .maybeSingle();

    return existingVote !== null;
  };

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email para votar');
      return;
    }

    setSelections(prev => {
      const currentSelections = prev[questionnaireId]?.[optionType] || [];
      const isSelected = currentSelections.includes(optionNumber);
      
      return {
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: isSelected
            ? currentSelections.filter(num => num !== optionNumber)
            : currentSelections.length >= 3
              ? currentSelections
              : [...currentSelections, optionNumber]
        }
      };
    });
  };

  const handleConfirmVotes = async (questionnaireId: string) => {
    const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
    if (!questionnaire) return;

    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return;

    // Validate that each section has exactly 3 votes
    if (!questionnaireSelections.strengths || questionnaireSelections.strengths.length !== 3 ||
        !questionnaireSelections.challenges || questionnaireSelections.challenges.length !== 3 ||
        !questionnaireSelections.opportunities || questionnaireSelections.opportunities.length !== 3) {
      toast.error('Por favor, selecione exatamente 3 opções em cada seção antes de confirmar');
      return;
    }

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

  if (!isEmailVerified) {
    return (
      <EmailVerification
        email={userEmail}
        onEmailChange={setUserEmail}
        onVerify={verifyEmail}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const processOptions = (questionnaires: any[], type: 'strengths' | 'challenges' | 'opportunities') => {
    return questionnaires.map(questionnaire => ({
      id: questionnaire.id,
      text: questionnaire[type].split('\n\n').filter(Boolean),
      selections: selections[questionnaire.id]?.[type] || []
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="text-gray-500">Votando com o email: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        <div className="space-y-8">
          <VotingSection
            title="Pontos Fortes"
            type="strengths"
            bgColor="bg-[#228B22]"
            options={processOptions(questionnaires || [], 'strengths')}
            onVote={handleVote}
          />

          <VotingSection
            title="Desafios"
            type="challenges"
            bgColor="bg-[#FFD700]"
            options={processOptions(questionnaires || [], 'challenges')}
            onVote={handleVote}
          />

          <VotingSection
            title="Oportunidades"
            type="opportunities"
            bgColor="bg-[#000080]"
            options={processOptions(questionnaires || [], 'opportunities')}
            onVote={handleVote}
          />

          {questionnaires?.map((questionnaire) => {
            const questionnaireSelections = selections[questionnaire.id] || {
              strengths: [],
              challenges: [],
              opportunities: []
            };
            
            const allSectionsComplete = 
              questionnaireSelections.strengths.length === 3 &&
              questionnaireSelections.challenges.length === 3 &&
              questionnaireSelections.opportunities.length === 3;

            return (
              <ConfirmVoteButton
                key={questionnaire.id}
                onConfirm={() => handleConfirmVotes(questionnaire.id)}
                disabled={!allSectionsComplete}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireVoting;
