import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailInput } from "@/components/EmailInput";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { Button } from "@/components/ui/button";

type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selections, setSelections] = useState<VoteSelection>({});
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
      console.log('Fetching questionnaires data...');
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

      console.log('Questionnaires data fetched:', questionnairesData);
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
      const { data: existingVote } = await supabase
        .from('dimension_votes')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .eq('dimension', dimension)
        .maybeSingle();

      if (existingVote) {
        throw new Error('Você já votou nesta dimensão');
      }

      // Insert dimension vote record
      const { error: dimensionVoteError } = await supabase
        .from('dimension_votes')
        .insert({
          email: userEmail.toLowerCase(),
          dimension: dimension
        });

      if (dimensionVoteError) throw dimensionVoteError;

      // Insert vote records
      const votePromises = votes.map(({ optionType, optionNumbers }) =>
        optionNumbers.map(optionNumber =>
          supabase
            .from('questionnaire_votes')
            .insert({
              questionnaire_id: questionnaireId,
              vote_type: 'upvote',
              option_type: optionType,
              option_number: optionNumber,
            })
        )
      ).flat();

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

  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

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