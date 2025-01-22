import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EmailInput } from "@/components/EmailInput";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
            <p className="text-gray-500">Vote nos questionários usando seu email cadastrado</p>
          </div>

          <EmailInput email={userEmail} onChange={setUserEmail} />

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
                  onVote={(optionType, optionNumber, voteType) => 
                    handleVote(questionnaire.id, optionType, optionNumber, voteType)
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default QuestionnaireVoting;