import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailInput } from "@/components/EmailInput";
import { Button } from "@/components/ui/button";
import { VoteButtons } from "@/components/VoteButtons";

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string>("todos");
  const [selections, setSelections] = useState<{
    [key: string]: {
      strengths: number[];
      challenges: number[];
      opportunities: number[];
    };
  }>({});
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

  const renderSection = (questionnaire: any, title: string, type: 'strengths' | 'challenges' | 'opportunities', bgColor: string) => {
    const options = questionnaire[type].split('\n\n').filter(Boolean);
    const currentSelections = selections[questionnaire.id]?.[type] || [];

    return (
      <Card className="p-6 mb-4">
        <h3 className={`font-medium p-2 rounded-lg ${bgColor} ${type === 'challenges' ? 'text-gray-900' : 'text-white'} mb-4`}>
          {title}
        </h3>
        <div className="space-y-2">
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <p className="flex-1 text-sm">{option}</p>
              <VoteButtons
                isSelected={currentSelections.includes(index + 1)}
                onVote={() => handleVote(questionnaire.id, type, index + 1)}
                disabled={currentSelections.length >= 3 && !currentSelections.includes(index + 1)}
              />
            </div>
          ))}
        </div>
      </Card>
    );
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
          <div className="space-y-8">
            {questionnaires?.map((questionnaire) => (
              <Card key={questionnaire.id} className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">{questionnaire.dimension}</h2>
                  <div className="mt-2">
                    <span className="bg-[#0D9488] text-white px-2 py-1 rounded">
                      {questionnaire.group || 'Sem grupo'}
                    </span>
                  </div>
                </div>

                {renderSection(questionnaire, "Pontos Fortes", 'strengths', 'bg-[#228B22]')}
                {renderSection(questionnaire, "Desafios", 'challenges', 'bg-[#FFD700]')}
                {renderSection(questionnaire, "Oportunidades", 'opportunities', 'bg-[#000080]')}

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => handleConfirmVotes(questionnaire.id)}
                    disabled={
                      !selections[questionnaire.id] ||
                      !selections[questionnaire.id].strengths ||
                      !selections[questionnaire.id].challenges ||
                      !selections[questionnaire.id].opportunities ||
                      selections[questionnaire.id].strengths.length !== 3 ||
                      selections[questionnaire.id].challenges.length !== 3 ||
                      selections[questionnaire.id].opportunities.length !== 3
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    Confirmar Votos
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireVoting;