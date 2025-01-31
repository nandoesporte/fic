import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Backup {
  id: string;
  created_at: string;
  filename: string;
  type: string;
  description?: string;
}

export const useBackupOperations = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);

  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('data_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Erro ao carregar backups');
    }
  };

  const handleExportAndClear = async (backupName: string) => {
    if (!backupName.trim()) {
      toast.error('Nome do backup é obrigatório');
      return;
    }

    setIsExporting(true);
    try {
      // First, fetch all questionnaire data
      const { data: questionnaires, error: fetchError } = await supabase
        .from('fic_questionnaires')
        .select('*');

      if (fetchError) throw fetchError;

      const currentDate = new Date().toLocaleDateString('pt-BR');
      const description = `Backup ${backupName} - Criado em ${currentDate}`;

      // Create backup record
      const { error: backupError } = await supabase
        .from('data_backups')
        .insert({
          filename: backupName,
          data: questionnaires,
          type: 'questionnaire_export',
          description: description
        });

      if (backupError) throw backupError;

      // Call the clean_questionnaire_votes function
      const { error: cleanError } = await supabase
        .rpc('clean_questionnaire_votes');

      if (cleanError) throw cleanError;

      toast.success('Dados exportados e limpos com sucesso');
      await fetchBackups();
    } catch (error) {
      console.error('Error during export and clear:', error);
      toast.error('Erro ao exportar e limpar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      const { data, error } = await supabase
        .from('data_backups')
        .select('data')
        .eq('id', backup.id)
        .single();

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup baixado com sucesso');
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Erro ao baixar backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const { error } = await supabase
        .from('data_backups')
        .delete()
        .eq('id', backupId);

      if (error) throw error;
      
      await fetchBackups();
      toast.success('Backup deletado com sucesso');
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Erro ao deletar backup');
    }
  };

  return {
    isExporting,
    backups,
    fetchBackups,
    handleExportAndClear,
    downloadBackup,
    deleteBackup
  };
};