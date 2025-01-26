import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Questionnaire {
  id: string;
  strengths_statuses: string;
  challenges_statuses: string;
  opportunities_statuses: string;
  [key: string]: any;
}

export const useQuestionnaireMutations = () => {
  const queryClient = useQueryClient();

  const updateLineMutation = useMutation({
    mutationFn: async ({ questionnaireId, type, lines }: { 
      questionnaireId: string; 
      type: 'strengths' | 'challenges' | 'opportunities';
      lines: string[];
    }) => {
      console.log('Updating lines:', { questionnaireId, type, lines });
      const { error } = await supabase
        .from('fic_questionnaires')
        .update({ [type]: lines.join('\n\n') })
        .eq('id', questionnaireId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ questionnaireId, type, index, currentStatus }: { 
      questionnaireId: string; 
      type: 'strengths' | 'challenges' | 'opportunities';
      index: number;
      currentStatus: string;
    }) => {
      console.log('Toggling status:', { questionnaireId, type, index, currentStatus });
      
      const questionnaires = queryClient.getQueryData(['questionnaires']) as Questionnaire[] | undefined;
      const questionnaire = questionnaires?.find((q) => q.id === questionnaireId);
      
      if (!questionnaire) {
        throw new Error('Questionnaire not found');
      }

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
      
      console.log('Status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error toggling status:', error);
      toast.error('Erro ao atualizar status');
    }
  });

  return {
    updateLineMutation,
    toggleStatusMutation
  };
};