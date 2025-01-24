import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useExportOperations = () => {
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExportAndClear = async (backupName: string) => {
    setIsExporting(true);
    try {
      const { data: questionnaires, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*');
      
      if (questionnairesError) {
        console.error('Error fetching questionnaires:', questionnairesError);
        toast.error('Erro ao buscar questionários');
        throw questionnairesError;
      }

      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*');
      
      if (votesError) {
        console.error('Error fetching votes:', votesError);
        toast.error('Erro ao buscar votos');
        throw votesError;
      }

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
          toast.error('Erro ao criar backup de questionários');
          throw backupError;
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
          toast.error('Erro ao criar backup de votos');
          throw backupError;
        }
      }

      const { error: clearQuestionnaireError } = await supabase
        .from('fic_questionnaires')
        .delete()
        .not('id', 'is', null);
      
      if (clearQuestionnaireError) {
        console.error('Error clearing questionnaires:', clearQuestionnaireError);
        toast.error('Erro ao limpar questionários');
        throw clearQuestionnaireError;
      }

      const { error: clearVotesError } = await supabase
        .from('questionnaire_votes')
        .delete()
        .not('id', 'is', null);
      
      if (clearVotesError) {
        console.error('Error clearing votes:', clearVotesError);
        toast.error('Erro ao limpar votos');
        throw clearVotesError;
      }

      await queryClient.invalidateQueries({ queryKey: ['data-backups'] });
      toast.success('Dados exportados e limpos com sucesso!');
    } catch (error) {
      console.error('Export and clear error:', error);
      toast.error('Erro ao exportar e limpar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportAndClear,
  };
};