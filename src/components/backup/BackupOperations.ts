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

      // Se for o formato antigo (apenas questionários)
      if (Array.isArray(backupData)) {
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
      // Se for o formato novo (com votos)
      else if (backupData.questionnaires) {
        const metadata = backupData.export_metadata || {};
        
        // 1. ABA RESUMO GERAL
        const resumoData = [{
          'Total de Questionários': metadata.total_questionnaires || 0,
          'Total de Votos em Questionários': metadata.total_questionnaire_votes || 0,
          'Total de Votos por Dimensão': metadata.total_dimension_votes || 0,
          'Total de Votos Gerais': metadata.total_votes || 0,
          'Data do Backup': metadata.timestamp ? new Date(metadata.timestamp).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          'Descrição': backup.description || 'Backup completo do sistema'
        }];
        const resumoWs = XLSX.utils.json_to_sheet(resumoData);
        resumoWs['!cols'] = [
          { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 40 }
        ];
        XLSX.utils.book_append_sheet(wb, resumoWs, "📊 Resumo");

        // 2. ABA QUESTIONÁRIOS
        const questionnaires = Array.isArray(backupData.questionnaires) ? backupData.questionnaires : [];
        if (questionnaires.length > 0) {
          const questionnaireData = questionnaires.map((q: any) => ({
            'ID do Questionário': q.id?.substring(0, 8) + '...',
            'Dimensão': q.dimension,
            'Grupo': q.group || q.group_name || '-',
            'Data de Criação': new Date(q.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(q.created_at).toLocaleTimeString('pt-BR'),
            'Status': q.status || 'N/A',
            'Pontos Fortes (3 opções)': q.strengths?.replace(/\n\n/g, ' | ') || '',
            'Desafios (3 opções)': q.challenges?.replace(/\n\n/g, ' | ') || '',
            'Oportunidades (3 opções)': q.opportunities?.replace(/\n\n/g, ' | ') || ''
          }));

          const questionnaireWs = XLSX.utils.json_to_sheet(questionnaireData);
          questionnaireWs['!cols'] = [
            { wch: 15 }, // ID
            { wch: 20 }, // Dimensão
            { wch: 15 }, // Grupo
            { wch: 20 }, // Data
            { wch: 12 }, // Status
            { wch: 60 }, // Pontos Fortes
            { wch: 60 }, // Desafios
            { wch: 60 }  // Oportunidades
          ];
          XLSX.utils.book_append_sheet(wb, questionnaireWs, "📝 Questionários");
        }

        // 3. ABA VOTOS EM QUESTIONÁRIOS (mais detalhada)
        const questionnaireVotes = Array.isArray(backupData.questionnaire_votes) ? backupData.questionnaire_votes : [];
        if (questionnaireVotes.length > 0) {
          const questionnaireVoteData = questionnaireVotes.map((v: any) => {
            // Encontrar o questionário correspondente para obter mais contexto
            const questionnaire = questionnaires.find((q: any) => q.id === v.questionnaire_id);
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
              'Opção Escolhida': `Opção ${v.option_number}`,
              'Data do Voto': new Date(v.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(v.created_at).toLocaleTimeString('pt-BR'),
              'Tipo de Voto': v.vote_type || 'padrão',
              'ID do Questionário': v.questionnaire_id?.substring(0, 8) + '...'
            };
          });

          const voteWs = XLSX.utils.json_to_sheet(questionnaireVoteData);
          voteWs['!cols'] = [
            { wch: 30 }, // Email
            { wch: 20 }, // Dimensão
            { wch: 15 }, // Grupo
            { wch: 20 }, // Seção
            { wch: 15 }, // Opção
            { wch: 20 }, // Data
            { wch: 12 }, // Tipo
            { wch: 15 }  // ID Questionário
          ];
          XLSX.utils.book_append_sheet(wb, voteWs, "🗳️ Votos Detalhados");
        }

        // 4. ABA ANÁLISE DE VOTOS POR DIMENSÃO
        const dimensionVotes = Array.isArray(backupData.dimension_votes) ? backupData.dimension_votes : [];
        if (dimensionVotes.length > 0) {
          const dimensionVoteData = dimensionVotes.map((v: any) => ({
            'Email do Votante': v.email,
            'Dimensão Escolhida': v.dimension,
            'Data da Escolha': new Date(v.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(v.created_at).toLocaleTimeString('pt-BR'),
            'ID do Voto': v.id?.substring(0, 8) + '...'
          }));

          const dimVoteWs = XLSX.utils.json_to_sheet(dimensionVoteData);
          dimVoteWs['!cols'] = [
            { wch: 30 }, // Email
            { wch: 25 }, // Dimensão
            { wch: 20 }, // Data
            { wch: 15 }  // ID
          ];
          XLSX.utils.book_append_sheet(wb, dimVoteWs, "📊 Votos por Dimensão");
        }

        // 5. ABA ESTATÍSTICAS DE PARTICIPAÇÃO
        if (questionnaireVotes.length > 0) {
          // Calcular estatísticas
          const emailVotes = questionnaireVotes.reduce((acc: any, vote: any) => {
            acc[vote.email] = (acc[vote.email] || 0) + 1;
            return acc;
          }, {});

          const sectionVotes = questionnaireVotes.reduce((acc: any, vote: any) => {
            const section = vote.option_type;
            acc[section] = (acc[section] || 0) + 1;
            return acc;
          }, {});

          const participationData = Object.entries(emailVotes).map(([email, count]) => ({
            'Email': email,
            'Total de Votos': count,
            'Participação': (count as number) > 5 ? 'Alta' : (count as number) > 2 ? 'Média' : 'Baixa'
          }));

          const participationWs = XLSX.utils.json_to_sheet(participationData);
          participationWs['!cols'] = [
            { wch: 30 }, // Email
            { wch: 15 }, // Total
            { wch: 15 }  // Participação
          ];
          XLSX.utils.book_append_sheet(wb, participationWs, "📈 Participação");

          // Adicionar estatísticas por seção
          const sectionStatsData = Object.entries(sectionVotes).map(([section, count]) => {
            const sectionMap = {
              'strengths': 'Pontos Fortes',
              'challenges': 'Desafios',
              'opportunities': 'Oportunidades'
            };
            return {
              'Seção': sectionMap[section as keyof typeof sectionMap] || section,
              'Total de Votos': count,
              'Porcentagem': `${Math.round((count as number / questionnaireVotes.length) * 100)}%`
            };
          });

          const sectionStatsWs = XLSX.utils.json_to_sheet(sectionStatsData);
          sectionStatsWs['!cols'] = [
            { wch: 20 }, // Seção
            { wch: 15 }, // Total
            { wch: 15 }  // Porcentagem
          ];
          XLSX.utils.book_append_sheet(wb, sectionStatsWs, "📊 Stats por Seção");
        }
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