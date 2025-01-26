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
      
      const { data: questionnaire, error: fetchError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .eq('id', questionnaireId)
        .single();

      if (fetchError) throw fetchError;

      const statusField = `${type}_statuses`;
      const statuses = (questionnaire[statusField] || 'pending,pending,pending').split(',')
        .map((status: string, i: number) => i === index ? (status === 'active' ? 'pending' : 'active') : status);

      const hasActiveStatus = statuses.includes('active');

      const { error: updateError } = await supabase
        .from('fic_questionnaires')
        .update({ 
          [statusField]: statuses.join(','),
          status: hasActiveStatus ? 'active' : 'pending'
        })
        .eq('id', questionnaireId);

      if (updateError) throw updateError;
      
      console.log('Status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
  });

  return {
    updateLineMutation,
    toggleStatusMutation
  };
};