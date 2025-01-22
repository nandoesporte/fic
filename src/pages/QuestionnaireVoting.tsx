import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
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

  const voteMutation = useMutation({
    mutationFn: async ({ questionnaireId, optionType, optionNumber, voteType, email }: { 
      questionnaireId: string; 
      optionType: 'strengths' | 'challenges' | 'opportunities';
      optionNumber: number;
      voteType: 'upvote' | 'downvote';
      email: string;
    }) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        throw new Error('Email não encontrado');
      }

      const { data: existingVote, error: fetchError } = await supabase
        .from('questionnaire_votes')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .eq('user_id', profile.id)
        .eq('option_type', optionType)
        .eq('option_number', optionNumber)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          const { error } = await supabase
            .from('questionnaire_votes')
            .delete()
            .eq('questionnaire_id', questionnaireId)
            .eq('user_id', profile.id)
            .eq('option_type', optionType)
            .eq('option_number', optionNumber);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('questionnaire_votes')
            .update({ vote_type: voteType })
            .eq('questionnaire_id', questionnaireId)
            .eq('user_id', profile.id)
            .eq('option_type', optionType)
            .eq('option_number', optionNumber);
          
          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('questionnaire_votes')
          .insert({
            questionnaire_id: questionnaireId,
            user_id: profile.id,
            vote_type: voteType,
            option_type: optionType,
            option_number: optionNumber,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Voto registrado com sucesso');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao registrar voto');
    },
  });

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number, voteType: 'upvote' | 'downvote') => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email para votar');
      return;
    }
    voteMutation.mutate({ questionnaireId, optionType, optionNumber, voteType, email: userEmail });
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

  const splitText = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim() !== '');
  };

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
            <p className="text-gray-500">Vote nos questionários usando seu email cadastrado</p>
          </div>

          <div className="mb-6">
            <Input
              type="email"
              placeholder="Digite seu email para votar"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {questionnaires?.map((questionnaire) => (
                <Card key={questionnaire.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="font-medium text-lg">
                      Dimensão: {questionnaire.dimension}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="space-y-4">
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
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default QuestionnaireVoting;