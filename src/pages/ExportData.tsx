import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Database, Trash2, RefreshCw } from "lucide-react";

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

  const handleExportAndClear = async () => {
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
            filename: `questionarios_${new Date().toISOString()}.json`,
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
            filename: `votos_${new Date().toISOString()}.json`,
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
            <p className="text-gray-500">Gerencie backups e limpe os dados do sistema</p>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Exportar e Limpar Dados</h2>
                <p className="text-gray-500">
                  Esta ação irá criar um backup dos dados atuais e limpar as tabelas
                </p>
              </div>
              <Button
                onClick={handleExportAndClear}
                disabled={isExporting}
                className="bg-primary hover:bg-primary/90"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Exportar e Limpar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Backups Disponíveis</h2>
            {isLoading ? (
              <p className="text-center text-gray-500">Carregando backups...</p>
            ) : backups?.length === 0 ? (
              <p className="text-center text-gray-500">Nenhum backup encontrado</p>
            ) : (
              <div className="space-y-4">
                {backups?.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border"
                  >
                    <div>
                      <h3 className="font-medium">
                        {backup.type === 'questionnaires' ? 'Questionários' : 'Votos'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(backup.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadBackup(backup)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExportData;