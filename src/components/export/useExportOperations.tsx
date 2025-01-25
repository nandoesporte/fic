import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useExportOperations = () => {
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExportAndClear = async (backupName: string) => {
    if (!backupName.trim()) {
      toast.error('Nome do backup é obrigatório');
      return;
    }

    setIsExporting(true);
    try {
      // Fetch questionnaires
      const { data: questionnaires, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (questionnairesError) {
        console.error('Error fetching questionnaires:', questionnairesError);
        throw new Error('Erro ao buscar questionários');
      }

      // Fetch votes
      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (votesError) {
        console.error('Error fetching votes:', votesError);
        throw new Error('Erro ao buscar votos');
      }

      // Create backups if there's data
      if (questionnaires && questionnaires.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_questionarios_${new Date().toISOString()}.csv`,
            data: questionnaires,
            type: 'questionnaires'
          });

        if (backupError) {
          console.error('Error creating questionnaires backup:', backupError);
          throw new Error('Erro ao criar backup de questionários');
        }
      }

      if (votes && votes.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_votos_${new Date().toISOString()}.csv`,
            data: votes,
            type: 'votes'
          });

        if (backupError) {
          console.error('Error creating votes backup:', backupError);
          throw new Error('Erro ao criar backup de votos');
        }
      }

      // Clear questionnaires
      const { error: clearQuestionnaireError } = await supabase
        .from('fic_questionnaires')
        .delete()
        .not('id', 'is', null);
      
      if (clearQuestionnaireError) {
        console.error('Error clearing questionnaires:', clearQuestionnaireError);
        throw new Error('Erro ao limpar questionários');
      }

      // Clear votes
      const { error: clearVotesError } = await supabase
        .from('questionnaire_votes')
        .delete()
        .not('id', 'is', null);
      
      if (clearVotesError) {
        console.error('Error clearing votes:', clearVotesError);
        throw new Error('Erro ao limpar votos');
      }

      await queryClient.invalidateQueries({ queryKey: ['data-backups'] });
      toast.success('Dados exportados e limpos com sucesso!');
    } catch (error) {
      console.error('Export and clear error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar e limpar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportAndClear,
  };
};