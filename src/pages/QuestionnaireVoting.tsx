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

      const consolidatedQuestionnaires = questionnairesData.reduce((acc: { [key: string]: any }, curr) => {
        if (!acc[curr.dimension]) {
          const strengths_array = curr.strengths.split('\n\n');
          const challenges_array = curr.challenges.split('\n\n');
          const opportunities_array = curr.opportunities.split('\n\n');
          
          const strengths_statuses = (curr.strengths_statuses || 'pending,pending,pending').split(',');
          const challenges_statuses = (curr.challenges_statuses || 'pending,pending,pending').split(',');
          const opportunities_statuses = (curr.opportunities_statuses || 'pending,pending,pending').split(',');
          
          const filtered_strengths = strengths_array.filter((_, index) => strengths_statuses[index] === 'active');
          const filtered_challenges = challenges_array.filter((_, index) => challenges_statuses[index] === 'active');
          const filtered_opportunities = opportunities_array.filter((_, index) => opportunities_statuses[index] === 'active');

          acc[curr.dimension] = {
            id: curr.id,
            dimension: curr.dimension,
            strengths: filtered_strengths.join('\n\n'),
            challenges: filtered_challenges.join('\n\n'),
            opportunities: filtered_opportunities.join('\n\n'),
            created_at: curr.created_at,
            strengths_statuses: curr.strengths_statuses,
            challenges_statuses: curr.challenges_statuses,
            opportunities_statuses: curr.opportunities_statuses,
          };
        }
        return acc;
      }, {});

      return Object.values(consolidatedQuestionnaires);
    },
    enabled: isEmailVerified,
  });

  const checkExistingVote = async (questionnaireId: string, userId: string) => {
    const { data: existingVotes } = await supabase
      .from('questionnaire_votes')
      .select('id')
      .eq('questionnaire_id', questionnaireId)
      .eq('user_id', userId);

    return existingVotes && existingVotes.length > 0;
  };

  const submitVotesMutation = useMutation({
    mutationFn: async ({ questionnaireId, votes }: { 
      questionnaireId: string;
      votes: {
        optionType: string;
        optionNumbers: number[];
      }[];
    }) => {
      let userProfileId: string;

      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();

      if (!existingProfile) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userEmail.toLowerCase(),
          password: crypto.randomUUID(),
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          throw new Error('Erro ao criar usuário');
        }

        userProfileId = authData.user?.id;
        if (!userProfileId) throw new Error('Erro ao criar usuário');
      } else {
        userProfileId = existingProfile.id;
      }

      // First, delete all existing votes for this questionnaire and user
      const { error: deleteError } = await supabase
        .from('questionnaire_votes')
        .delete()
        .match({
          questionnaire_id: questionnaireId,
          user_id: userProfileId
        });

      if (deleteError) {
        console.error('Error deleting existing votes:', deleteError);
        throw new Error('Erro ao limpar votos existentes');
      }

      // Then insert all new votes in a transaction-like manner
      try {
        for (const { optionType, optionNumbers } of votes) {
          for (const optionNumber of optionNumbers) {
            const { error: insertError } = await supabase
              .from('questionnaire_votes')
              .insert({
                questionnaire_id: questionnaireId,
                user_id: userProfileId,
                vote_type: 'upvote',
                option_type: optionType,
                option_number: optionNumber,
              });

            if (insertError) {
              console.error('Error inserting vote:', insertError);
              // If we get a unique constraint violation, it means another vote was inserted
              // between our delete and insert operations
              if (insertError.code === '23505') {
                throw new Error('Erro: outro voto foi registrado simultaneamente. Por favor, tente novamente.');
              }
              throw insertError;
            }
          }
        }
      } catch (error) {
        // If any insert fails, we should try to clean up any votes that were inserted
        await supabase
          .from('questionnaire_votes')
          .delete()
          .match({
            questionnaire_id: questionnaireId,
            user_id: userProfileId
          });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      queryClient.invalidateQueries({ queryKey: ['questionnaire-votes'] });
      toast.success('Votos registrados com sucesso!');
      setSelections({});
    },
    onError: (error) => {
      console.error('Vote submission error:', error);
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

    await submitVotesMutation.mutate({ 
      questionnaireId,
      votes,
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
