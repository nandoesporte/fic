import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExportCard } from "@/components/export/ExportCard";
import { BackupList } from "@/components/export/BackupList";

const ExportData = () => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const { data: backups, isLoading } = useQuery({
    queryKey: ['data-backups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching backups:', error);
        toast.error('Erro ao carregar backups');
        throw error;
      }
      return data;
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const { error } = await supabase
        .from('data_backups')
        .delete()
        .eq('id', backupId);

      if (error) {
        console.error('Delete error:', error);
        toast.error('Erro ao excluir backup');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-backups'] });
      toast.success('Backup excluído com sucesso');
    },
  });

  const handleExportAndClear = async (backupName: string) => {
    setIsExporting(true);
    try {
      // Fetch questionnaires
      const { data: questionnaires, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*');
      
      if (questionnairesError) {
        console.error('Error fetching questionnaires:', questionnairesError);
        toast.error('Erro ao buscar questionários');
        throw questionnairesError;
      }

      // Fetch votes
      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*');
      
      if (votesError) {
        console.error('Error fetching votes:', votesError);
        toast.error('Erro ao buscar votos');
        throw votesError;
      }

      // Convert data to CSV format
      const convertToCSV = (data: any[]) => {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header])).join(','));
        return [headers.join(','), ...rows].join('\n');
      };

      // Create backup for questionnaires if they exist
      if (questionnaires && questionnaires.length > 0) {
        const csvData = convertToCSV(questionnaires);
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

      // Create backup for votes if they exist
      if (votes && votes.length > 0) {
        const csvData = convertToCSV(votes);
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

      // Clear questionnaires
      const { error: clearQuestionnaireError } = await supabase
        .from('fic_questionnaires')
        .delete()
        .not('id', 'is', null);
      
      if (clearQuestionnaireError) {
        console.error('Error clearing questionnaires:', clearQuestionnaireError);
        toast.error('Erro ao limpar questionários');
        throw clearQuestionnaireError;
      }

      // Clear votes
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

  const handleDownloadBackup = (backup: any) => {
    // Convert the data to CSV
    const convertToCSV = (data: any[]) => {
      if (!data || data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header])).join(','));
      return [headers.join(','), ...rows].join('\n');
    };

    const csvData = convertToCSV(backup.data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await deleteBackupMutation.mutateAsync(backupId);
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Exportar Dados</h1>
            <p className="text-gray-500 mt-1">Gerencie backups e limpe os dados do sistema</p>
          </div>

          <ExportCard 
            isExporting={isExporting} 
            onExport={handleExportAndClear} 
          />

          <BackupList
            backups={backups || []}
            isLoading={isLoading}
            onDownload={handleDownloadBackup}
            onDelete={handleDeleteBackup}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExportData;