import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Database } from "lucide-react";
import { BackupList } from "@/components/export/BackupList";
import { BackupCreationDialog } from "@/components/export/BackupCreationDialog";

const ExportData = () => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*');
      if (votesError) throw votesError;

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

      const { error: clearVotesError } = await supabase
        .from('questionnaire_votes')
        .delete()
        .not('id', 'is', null);
      if (clearVotesError) throw clearVotesError;

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

  const analyzeBackup = async (backup: any) => {
    setIsAnalyzing(true);
    try {
      const { data: dimensions } = await supabase
        .from('fic_dimensions')
        .select('*');

      if (!dimensions) {
        throw new Error('No dimensions found');
      }

      const votingData = backup.data;
      
      // Group votes by dimension
      const votesByDimension = dimensions.reduce((acc: any, dim: any) => {
        acc[dim.identifier] = votingData.filter((vote: any) => 
          vote.dimension === dim.identifier
        );
        return acc;
      }, {});

      // Analyze each dimension
      for (const [dimension, votes] of Object.entries(votesByDimension)) {
        const response = await supabase.functions.invoke('analyze-votes', {
          body: { votingData: votes, dimension }
        });

        if (response.error) {
          throw new Error(`Error analyzing dimension ${dimension}: ${response.error}`);
        }

        toast.success(`Análise da dimensão ${dimension} concluída!`);
        
        // Save the analysis report
        const { error: reportError } = await supabase
          .from('fic_reports')
          .insert([{  // Now we're passing an array with a single object
            title: `Análise de Votos - ${dimension}`,
            description: response.data.analysis,
            dimension: dimension,
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            metrics: { totalVotes: (votes as any[]).length }
          }]);

        if (reportError) {
          throw new Error(`Error saving report for dimension ${dimension}: ${reportError.message}`);
        }
      }

      toast.success('Análise completa! Os relatórios foram salvos.');
    } catch (error) {
      console.error('Error analyzing backup:', error);
      toast.error('Erro ao analisar o backup');
    } finally {
      setIsAnalyzing(false);
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
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
        <p className="text-gray-500 mt-2">Gerencie backups e limpe os dados do sistema</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Exportar e Limpar Dados
            </h2>
            <p className="text-gray-500 mt-1">
              Esta ação irá criar um backup dos dados atuais e limpar as tabelas
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsDialogOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" />
            Criar Novo Backup
          </Button>
        </div>
      </Card>

      <BackupList
        backups={backups || []}
        onDownload={handleDownloadBackup}
        onDelete={handleDeleteBackup}
        onAnalyze={analyzeBackup}
        isAnalyzing={isAnalyzing}
      />

      <BackupCreationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        backupName={backupName}
        onBackupNameChange={setBackupName}
        onConfirm={handleExportAndClear}
        isExporting={isExporting}
      />
    </div>
  );
};

export default ExportData;