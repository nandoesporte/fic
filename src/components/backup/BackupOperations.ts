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
      // Buscar todos os dados para exportação
      const [
        questionnaireResult,
        questionnaireVotesResult,
        dimensionVotesResult,
        votesResult,
        voteTrackingResult
      ] = await Promise.all([
        supabase.from('fic_questionnaires').select('*'),
        supabase.from('questionnaire_votes').select('*'),
        supabase.from('dimension_votes').select('*'),
        supabase.from('votes').select('*'),
        supabase.from('vote_tracking').select('*')
      ]);

      // Verificar se houve erros
      if (questionnaireResult.error) throw questionnaireResult.error;
      if (questionnaireVotesResult.error) throw questionnaireVotesResult.error;
      if (dimensionVotesResult.error) throw dimensionVotesResult.error;
      if (votesResult.error) throw votesResult.error;
      if (voteTrackingResult.error) throw voteTrackingResult.error;

      // Preparar dados completos para o backup
      const exportData = {
        questionnaires: questionnaireResult.data || [],
        questionnaire_votes: questionnaireVotesResult.data || [],
        dimension_votes: dimensionVotesResult.data || [],
        votes: votesResult.data || [],
        vote_tracking: voteTrackingResult.data || [],
        export_metadata: {
          timestamp: new Date().toISOString(),
          total_questionnaires: questionnaireResult.data?.length || 0,
          total_questionnaire_votes: questionnaireVotesResult.data?.length || 0,
          total_dimension_votes: dimensionVotesResult.data?.length || 0,
          total_votes: votesResult.data?.length || 0,
          total_vote_tracking_records: voteTrackingResult.data?.length || 0
        }
      };

      console.log('Exporting backup with data:', {
        questionnaires: exportData.questionnaires.length,
        questionnaire_votes: exportData.questionnaire_votes.length,
        dimension_votes: exportData.dimension_votes.length,
        votes: exportData.votes.length,
        vote_tracking: exportData.vote_tracking.length
      });

      // Criar backup record com todos os dados
      const { error: backupError } = await supabase
        .from('data_backups')
        .insert({
          filename: backupName,
          data: exportData,
          type: 'complete_system_export',
          description: `Backup completo criado em ${new Date().toLocaleDateString('pt-BR')} - Inclui questionários e todos os votos`
        });

      if (backupError) throw backupError;

      // Chamar função de limpeza dos votos de questionários
      const { error: cleanError } = await supabase
        .rpc('clean_questionnaire_votes');

      if (cleanError) throw cleanError;

      toast.success('Dados exportados e limpos com sucesso - Incluindo todos os votos');
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

      // Extrair dados dos questionários e votos
      const backupData = data.data;
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Dados de backup inválidos');
      }

      let excelData: any[] = [];

      // Se for o formato antigo (apenas questionários)
      if (Array.isArray(backupData)) {
        excelData = backupData.map((q: any) => ({
          'ID': q.id,
          'Dimensão': q.dimension,
          'Data de Criação': new Date(q.created_at).toLocaleDateString('pt-BR'),
          'Pontos Fortes': q.strengths || '',
          'Desafios': q.challenges || '',
          'Oportunidades': q.opportunities || ''
        }));
      } 
      // Se for o formato novo (com votos)
      else if (backupData.questionnaires) {
        // Preparar dados dos questionários
        const questionnaireData = (Array.isArray(backupData.questionnaires) ? backupData.questionnaires : []).map((q: any) => ({
          'Tipo': 'Questionário',
          'ID': q.id,
          'Dimensão': q.dimension,
          'Data de Criação': new Date(q.created_at).toLocaleDateString('pt-BR'),
          'Pontos Fortes': q.strengths || '',
          'Desafios': q.challenges || '',
          'Oportunidades': q.opportunities || '',
          'Email': '',
          'Opção Número': '',
          'Tipo de Voto': ''
        }));

        // Preparar dados dos votos de questionários
        const questionnaireVoteData = (Array.isArray(backupData.questionnaire_votes) ? backupData.questionnaire_votes : []).map((v: any) => ({
          'Tipo': 'Voto Questionário',
          'ID': v.id,
          'Dimensão': '',
          'Data de Criação': new Date(v.created_at).toLocaleDateString('pt-BR'),
          'Pontos Fortes': '',
          'Desafios': '',
          'Oportunidades': '',
          'Email': v.email,
          'Opção Número': v.option_number,
          'Tipo de Voto': v.option_type
        }));

        // Preparar dados dos votos por dimensão
        const dimensionVoteData = (Array.isArray(backupData.dimension_votes) ? backupData.dimension_votes : []).map((v: any) => ({
          'Tipo': 'Voto Dimensão',
          'ID': v.id,
          'Dimensão': v.dimension,
          'Data de Criação': new Date(v.created_at).toLocaleDateString('pt-BR'),
          'Pontos Fortes': '',
          'Desafios': '',
          'Oportunidades': '',
          'Email': v.email,
          'Opção Número': '',
          'Tipo de Voto': ''
        }));

        // Preparar dados dos votos gerais
        const generalVoteData = (Array.isArray(backupData.votes) ? backupData.votes : []).map((v: any) => ({
          'Tipo': 'Voto Geral',
          'ID': v.id,
          'Dimensão': '',
          'Data de Criação': new Date(v.created_at).toLocaleDateString('pt-BR'),
          'Pontos Fortes': '',
          'Desafios': '',
          'Oportunidades': '',
          'Email': v.email,
          'Opção Número': v.option_number,
          'Tipo de Voto': v.option_type
        }));

        // Combinar todos os dados
        excelData = [...questionnaireData, ...questionnaireVoteData, ...dimensionVoteData, ...generalVoteData];
      }

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar largura das colunas
      const wscols = [
        { wch: 20 }, // Tipo
        { wch: 15 }, // ID
        { wch: 15 }, // Dimensão
        { wch: 15 }, // Data
        { wch: 40 }, // Pontos Fortes
        { wch: 40 }, // Desafios
        { wch: 40 }, // Oportunidades
        { wch: 25 }, // Email
        { wch: 12 }, // Opção Número
        { wch: 15 }  // Tipo de Voto
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Backup Completo");
      
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