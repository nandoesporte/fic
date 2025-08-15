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
      const backupData = data.data as any;
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Dados de backup inválidos');
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Se for o formato novo (com votos)
      if (backupData.questionnaires) {
        const questionnaires = Array.isArray(backupData.questionnaires) ? backupData.questionnaires : [];
        const questionnaireVotes = Array.isArray(backupData.questionnaire_votes) ? backupData.questionnaire_votes : [];
        
        if (questionnaireVotes.length > 0) {
          const questionnaireVoteData = questionnaireVotes.map((v: any) => {
            // Encontrar o questionário correspondente para obter o texto da opção
            const questionnaire = questionnaires.find((q: any) => q.id === v.questionnaire_id);
            
            let optionText = 'Texto não encontrado';
            if (questionnaire && v.option_type && v.option_number) {
              const sectionText = questionnaire[v.option_type];
              if (sectionText) {
                // Dividir as opções por \n\n e pegar a opção correta
                const options = sectionText.split('\n\n').filter((opt: string) => opt.trim());
                if (options[v.option_number - 1]) {
                  optionText = options[v.option_number - 1].trim();
                }
              }
            }
            
            const sectionMap = {
              'strengths': 'Pontos Fortes',
              'challenges': 'Desafios', 
              'opportunities': 'Oportunidades'
            };
            
            return {
              'Email do Votante': v.email,
              'Dimensão': questionnaire?.dimension || 'N/A',
              'Grupo do Questionário': questionnaire?.group || questionnaire?.group_name || '-',
              'Seção Votada': sectionMap[v.option_type as keyof typeof sectionMap] || v.option_type,
              'Texto Completo da Opção': optionText,
              'Data do Voto': new Date(v.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(v.created_at).toLocaleTimeString('pt-BR'),
              'ID do Questionário': v.questionnaire_id?.substring(0, 8) + '...'
            };
          });

          const voteWs = XLSX.utils.json_to_sheet(questionnaireVoteData);
          voteWs['!cols'] = [
            { wch: 30 }, // Email
            { wch: 20 }, // Dimensão
            { wch: 20 }, // Grupo
            { wch: 20 }, // Seção
            { wch: 60 }, // Texto da Opção (mais largo)
            { wch: 20 }, // Data
            { wch: 15 }  // ID Questionário
          ];
          XLSX.utils.book_append_sheet(wb, voteWs, "🗳️ Votos Detalhados");
        }
      }
      // Se for o formato antigo (apenas questionários)
      else if (Array.isArray(backupData)) {
        const questionnaireData = backupData.map((q: any) => ({
          'ID do Questionário': q.id?.substring(0, 8) + '...',
          'Dimensão': q.dimension,
          'Grupo': q.group || q.group_name || '-',
          'Data de Criação': new Date(q.created_at).toLocaleDateString('pt-BR'),
          'Status': q.status || 'N/A',
          'Pontos Fortes': q.strengths?.replace(/\n\n/g, ' | ') || '',
          'Desafios': q.challenges?.replace(/\n\n/g, ' | ') || '',
          'Oportunidades': q.opportunities?.replace(/\n\n/g, ' | ') || ''
        }));

        const ws = XLSX.utils.json_to_sheet(questionnaireData);
        ws['!cols'] = [
          { wch: 15 }, // ID
          { wch: 20 }, // Dimensão
          { wch: 15 }, // Grupo
          { wch: 12 }, // Data
          { wch: 12 }, // Status
          { wch: 50 }, // Pontos Fortes
          { wch: 50 }, // Desafios
          { wch: 50 }  // Oportunidades
        ];
        XLSX.utils.book_append_sheet(wb, ws, "Questionários");
      }
      
      // Download do arquivo com nome mais descritivo
      const currentDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const fileName = `${backup.filename}_detalhado_${currentDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Backup exportado para Excel com formato intuitivo!');
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