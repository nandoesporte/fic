import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Database, RefreshCw, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ExportData = () => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      toast.success('Backup excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir backup');
    },
  });

  const handleExportAndClear = async () => {
    if (!backupName.trim()) {
      toast.error('Por favor, insira um nome para o backup');
      return;
    }

    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
            filename: `${backupName}_questionarios.json`,
            data: questionnaires,
            type: 'questionnaires',
            created_by: user.id,
            description: backupName
          });
        if (backupError) throw backupError;
      }

      // Create backup of votes
      if (votes && votes.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_votos.json`,
            data: votes,
            type: 'votes',
            created_by: user.id,
            description: backupName
          });
        if (backupError) throw backupError;
      }

      // Call the clean_questionnaire_votes function
      const { error: cleanError } = await supabase
        .rpc('clean_questionnaire_votes');
      if (cleanError) throw cleanError;

      queryClient.invalidateQueries({ queryKey: ['data-backups'] });
      toast.success('Dados exportados e limpos com sucesso!');
      setBackupName("");
      setIsDialogOpen(false);
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

  const handleDeleteBackup = (backupId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este backup?')) {
      deleteBackupMutation.mutate(backupId);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50/90">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
            <p className="text-gray-500 mt-2">Gerencie backups e limpe os dados do sistema</p>
          </div>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Exportar e Limpar Dados
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Esta ação irá criar um backup dos dados atuais, limpar as tabelas e resetar os votos
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Criar Novo Backup
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Backup</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="backupName" className="text-sm font-medium">
                          Nome do Backup
                        </label>
                        <Input
                          id="backupName"
                          placeholder="Digite um nome para o backup..."
                          value={backupName}
                          onChange={(e) => setBackupName(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleExportAndClear}
                        disabled={isExporting || !backupName.trim()}
                        className="w-full"
                      >
                        {isExporting ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Confirmar Backup
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Backups Disponíveis
              </h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-gray-500 mt-2">Carregando backups...</p>
                </div>
              ) : backups?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum backup encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups?.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {backup.description || backup.filename}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(backup.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExportData;
