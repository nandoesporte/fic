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

      if (error) throw error;
      return data;
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const { error } = await supabase
        .from('data_backups')
        .delete()
        .eq('id', backupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-backups'] });
    },
    onError: () => {
      toast.error('Erro ao excluir backup');
    },
  });

  const handleExportAndClear = async (backupName: string) => {
    if (!window.confirm('Tem certeza que deseja exportar e limpar os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all questionnaires
      const { data: questionnaires, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*');
      if (questionnairesError) throw questionnairesError;

      // Fetch all votes
      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*');
      if (votesError) throw votesError;

      // Create backup of questionnaires
      if (questionnaires && questionnaires.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_questionarios_${new Date().toISOString()}.json`,
            data: questionnaires,
            type: 'questionnaires'
          });
        if (backupError) throw backupError;
      }

      // Create backup of votes
      if (votes && votes.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_votos_${new Date().toISOString()}.json`,
            data: votes,
            type: 'votes'
          });
        if (backupError) throw backupError;
      }

      // Clear questionnaires
      const { error: clearQuestionnaireError } = await supabase
        .from('fic_questionnaires')
        .delete()
        .not('id', 'is', null);
      if (clearQuestionnaireError) throw clearQuestionnaireError;

      // Clear votes
      const { error: clearVotesError } = await supabase
        .from('questionnaire_votes')
        .delete()
        .not('id', 'is', null);
      if (clearVotesError) throw clearVotesError;

      queryClient.invalidateQueries({ queryKey: ['data-backups'] });
      toast.success('Dados exportados e limpos com sucesso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao exportar e limpar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBackup = (backup: any) => {
    const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' });
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
      toast.success('Backup excluído com sucesso');
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