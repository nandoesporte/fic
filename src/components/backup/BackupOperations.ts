import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

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
    setIsExporting(true);
    try {
      // First, fetch all questionnaire data
      const { data: questionnaires, error: fetchError } = await supabase
        .from('fic_questionnaires')
        .select('*');

      if (fetchError) throw fetchError;

      // Create backup record
      const { error: backupError } = await supabase
        .from('data_backups')
        .insert({
          filename: backupName,
          data: questionnaires,
          type: 'questionnaire_export',
          description: `Backup created on ${new Date().toLocaleDateString()}`
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

  const exportBackupToExcel = async (backup: Backup) => {
    try {
      const { data, error } = await supabase
        .from('data_backups')
        .select('data')
        .eq('id', backup.id)
        .single();

      if (error) throw error;

      // Extrair dados dos questionários
      const questionnaires = data.data;
      if (!questionnaires || !Array.isArray(questionnaires)) {
        throw new Error('Dados de backup inválidos');
      }

      // Preparar dados para Excel
      const excelData = questionnaires.map((q: any) => ({
        'ID': q.id,
        'Dimensão': q.dimension,
        'Data de Criação': new Date(q.created_at).toLocaleDateString('pt-BR'),
        'Pontos Fortes': q.strengths || '',
        'Desafios': q.challenges || '',
        'Oportunidades': q.opportunities || ''
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar largura das colunas
      const wscols = [
        { wch: 10 }, // ID
        { wch: 15 }, // Dimensão
        { wch: 15 }, // Data
        { wch: 50 }, // Pontos Fortes
        { wch: 50 }, // Desafios
        { wch: 50 }  // Oportunidades
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Questionários");
      
      // Download do arquivo
      XLSX.writeFile(wb, `${backup.filename}.xlsx`);
      
      toast.success('Backup exportado para Excel com sucesso');
    } catch (error) {
      console.error('Error exporting backup to Excel:', error);
      toast.error('Erro ao exportar backup para Excel');
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
    exportBackupToExcel,
    deleteBackup
  };
};