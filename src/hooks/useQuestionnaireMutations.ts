import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useQuestionnaireMutations = () => {
  const queryClient = useQueryClient();

  const updateLineMutation = useMutation({
    mutationFn: async ({ questionnaireId, type, lines }: { 
      questionnaireId: string; 
      type: 'strengths' | 'challenges' | 'opportunities';
      lines: string[];
    }) => {
      const { error } = await supabase
        .from('fic_questionnaires')
        .update({ [type]: lines.join('\n\n') })
        .eq('id', questionnaireId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Linha atualizada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar linha');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ questionnaireId, type, index, currentStatus }: { 
      questionnaireId: string; 
      type: 'strengths' | 'challenges' | 'opportunities';
      index: number;
      currentStatus: string;
    }) => {
      const questionnaires = await queryClient.getQueryData(['questionnaires']);
      const questionnaire = questionnaires?.find((q: any) => q.id === questionnaireId);
      if (!questionnaire) return;

      const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',')
        .map((status: string, i: number) => i === index ? (status === 'active' ? 'pending' : 'active') : status);

      const { error: updateError } = await supabase
        .from('fic_questionnaires')
        .update({ 
          [`${type}_statuses`]: statuses.join(','),
          status: statuses.includes('active') ? 'active' : 'pending'
        })
        .eq('id', questionnaireId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Toggle status error:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  return {
    updateLineMutation,
    toggleStatusMutation
  };
};