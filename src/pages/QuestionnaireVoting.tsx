import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailInput } from "@/components/EmailInput";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

type ConsolidatedQuestionnaire = {
  id: string;
  dimension: string;
  strengths: string;
  challenges: string;
  opportunities: string;
  created_at: string;
  questionnaire_ids: string[];
};

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selections, setSelections] = useState<VoteSelection>({});
  const queryClient = useQueryClient();
  const { session } = useAuth();

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

      const consolidatedQuestionnaires = questionnairesData.reduce((acc: { [key: string]: ConsolidatedQuestionnaire }, curr) => {
        if (!acc[curr.dimension]) {
          acc[curr.dimension] = {
            id: curr.dimension,
            dimension: curr.dimension,
            strengths: curr.strengths,
            challenges: curr.challenges,
            opportunities: curr.opportunities,
            created_at: curr.created_at,
            questionnaire_ids: [curr.id],
          };
        } else {
          acc[curr.dimension].strengths += '\n\n' + curr.strengths;
          acc[curr.dimension].challenges += '\n\n' + curr.challenges;
          acc[curr.dimension].opportunities += '\n\n' + curr.opportunities;
          acc[curr.dimension].questionnaire_ids.push(curr.id);
        }
        return acc;
      }, {});

      return Object.values(consolidatedQuestionnaires);
    },
    enabled: isEmailVerified,
  });

  const verifyEmail = async () => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email');
      return;
    }

    if (!session?.user) {
      toast.error('Você precisa estar autenticado para votar');
      return;
    }

    try {
      const { data: voterData, error: voterError } = await supabase
        .from('registered_voters')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();

      if (voterError) {
        console.error('Erro ao verificar email:', voterError);
        toast.error('Erro ao verificar email');
        return;
      }

      if (!voterData) {
        toast.error('Email não encontrado no sistema. Por favor, verifique se digitou corretamente.');
        return;
      }

      if (session.user.email !== userEmail) {
        toast.error('O email informado não corresponde ao usuário autenticado');
        return;
      }

      setIsEmailVerified(true);
      toast.success('Email verificado com sucesso!');
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      toast.error('Erro ao verificar email. Por favor, tente novamente.');
    }
  };

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

      const consolidatedQuestionnaire = questionnaires?.find(q => q.id === questionnaireId);
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
    if (!userEmail) {
      toast.error('Por favor, insira seu email para votar');
      return;
    }

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

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
            <p className="mt-2 text-gray-500">Você precisa estar autenticado para acessar o sistema de votação</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
            <p className="mt-2 text-gray-500">Digite seu email cadastrado para acessar o sistema de votação</p>
          </div>
          <EmailInput email={userEmail} onChange={setUserEmail} />
          <Button 
            className="w-full" 
            onClick={verifyEmail}
          >
            Acessar Sistema de Votação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="text-gray-500">Votando com o email: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {questionnaires?.map((questionnaire) => (
              <QuestionnaireCard
                key={questionnaire.id}
                questionnaire={questionnaire}
                onVote={(optionType, optionNumber) => 
                  handleVote(questionnaire.id, optionType, optionNumber)
                }
                isOptionSelected={(optionType, optionNumber) =>
                  isOptionSelected(questionnaire.id, optionType, optionNumber)
                }
                getSelectionCount={(optionType) =>
                  getSelectionCount(questionnaire.id, optionType)
                }
                onConfirmVotes={() => handleConfirmVotes(questionnaire.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireVoting;
