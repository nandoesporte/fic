import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const QuestionnaireResponses = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fic_questionnaires')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Questionário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
    onError: () => {
      toast.error('Erro ao excluir questionário');
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ questionnaireId, optionType, optionNumber, voteType }: { 
      questionnaireId: string; 
      optionType: 'strengths' | 'challenges' | 'opportunities';
      optionNumber: number;
      voteType: 'upvote' | 'downvote' 
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: existingVote, error: fetchError } = await supabase
        .from('questionnaire_votes')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .eq('user_id', user.id)
        .eq('option_type', optionType)
        .eq('option_number', optionNumber)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          const { error } = await supabase
            .from('questionnaire_votes')
            .delete()
            .eq('questionnaire_id', questionnaireId)
            .eq('user_id', user.id)
            .eq('option_type', optionType)
            .eq('option_number', optionNumber);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('questionnaire_votes')
            .update({ vote_type: voteType })
            .eq('questionnaire_id', questionnaireId)
            .eq('user_id', user.id)
            .eq('option_type', optionType)
            .eq('option_number', optionNumber);
          
          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('questionnaire_votes')
          .insert({
            questionnaire_id: questionnaireId,
            user_id: user.id,
            vote_type: voteType,
            option_type: optionType,
            option_number: optionNumber,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
    onError: () => {
      toast.error('Erro ao registrar voto');
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este questionário?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedQuestionnaire(id);
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number, voteType: 'upvote' | 'downvote') => {
    voteMutation.mutate({ questionnaireId, optionType, optionNumber, voteType });
  };

  const getVoteCounts = (questionnaire: any, optionType: string, optionNumber: number) => {
    const votes = questionnaire.questionnaire_vote_counts?.find(
      (v: any) => v.option_type === optionType && v.option_number === optionNumber
    );
    return {
      upvotes: votes?.upvotes || 0,
      downvotes: votes?.downvotes || 0,
    };
  };

  const renderVoteButtons = (questionnaire: any, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    const votes = getVoteCounts(questionnaire, optionType, optionNumber);
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote(questionnaire.id, optionType, optionNumber, 'upvote')}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          {votes.upvotes}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote(questionnaire.id, optionType, optionNumber, 'downvote')}
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          {votes.downvotes}
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getBgColor = (title: string) => {
    switch (title) {
      case "Pontos Fortes":
        return "bg-[#228B22]";
      case "Desafios":
        return "bg-[#FFD700]";
      case "Oportunidades":
        return "bg-[#000080]";
      default:
        return "";
    }
  };

  const getTextColor = (title: string) => {
    return title === "Desafios" ? "text-gray-900" : "text-white";
  };

  const splitText = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim() !== '');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="todos" className="flex-1">Todos</TabsTrigger>
          <TabsTrigger value="mais-votados" className="flex-1">Mais Votados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          {questionnaires?.map((questionnaire) => (
            <Card key={questionnaire.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">
                      Dimensão: {questionnaire.dimension}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(questionnaire.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(questionnaire.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Nível de Satisfação</h4>
                      <p>{questionnaire.satisfaction}/5</p>
                    </div>
                    <div>
                      <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Pontos Fortes")} ${getTextColor("Pontos Fortes")}`}>
                        Pontos Fortes
                      </h4>
                      <div className="space-y-2 mt-2">
                        {splitText(questionnaire.strengths).map((strength, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <p className="flex-1">{strength}</p>
                            {renderVoteButtons(questionnaire, 'strengths', index + 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Desafios")} ${getTextColor("Desafios")}`}>
                        Desafios
                      </h4>
                      <div className="space-y-2 mt-2">
                        {splitText(questionnaire.challenges).map((challenge, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <p className="flex-1">{challenge}</p>
                            {renderVoteButtons(questionnaire, 'challenges', index + 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Oportunidades")} ${getTextColor("Oportunidades")}`}>
                        Oportunidades
                      </h4>
                      <div className="space-y-2 mt-2">
                        {splitText(questionnaire.opportunities).map((opportunity, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <p className="flex-1">{opportunity}</p>
                            {renderVoteButtons(questionnaire, 'opportunities', index + 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mais-votados">
          {questionnaires
            ?.sort((a, b) => {
              const getTotalVotes = (questionnaire: any) => {
                return (questionnaire.questionnaire_vote_counts || []).reduce((acc: number, curr: any) => {
                  return acc + (curr.upvotes || 0) - (curr.downvotes || 0);
                }, 0);
              };
              return getTotalVotes(b) - getTotalVotes(a);
            })
            .map((questionnaire) => (
              // ... keep existing code (same card content as above)
              <Card key={questionnaire.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-lg">
                        Dimensão: {questionnaire.dimension}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(questionnaire.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(questionnaire.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Nível de Satisfação</h4>
                        <p>{questionnaire.satisfaction}/5</p>
                      </div>
                      <div>
                        <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Pontos Fortes")} ${getTextColor("Pontos Fortes")}`}>
                          Pontos Fortes
                        </h4>
                        <div className="space-y-2 mt-2">
                          {splitText(questionnaire.strengths).map((strength, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <p className="flex-1">{strength}</p>
                              {renderVoteButtons(questionnaire, 'strengths', index + 1)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Desafios")} ${getTextColor("Desafios")}`}>
                          Desafios
                        </h4>
                        <div className="space-y-2 mt-2">
                          {splitText(questionnaire.challenges).map((challenge, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <p className="flex-1">{challenge}</p>
                              {renderVoteButtons(questionnaire, 'challenges', index + 1)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Oportunidades")} ${getTextColor("Oportunidades")}`}>
                          Oportunidades
                        </h4>
                        <div className="space-y-2 mt-2">
                          {splitText(questionnaire.opportunities).map((opportunity, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <p className="flex-1">{opportunity}</p>
                              {renderVoteButtons(questionnaire, 'opportunities', index + 1)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {questionnaires?.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Nenhum questionário encontrado.
        </p>
      )}
    </div>
  );
};