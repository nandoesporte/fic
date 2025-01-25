import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Database, RefreshCw, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const BackupList = () => {
  const queryClient = useQueryClient();

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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-gray-500 mt-2">Carregando backups...</p>
      </div>
    );
  }

  if (!backups?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Database className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>Nenhum backup encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {backups.map((backup) => (
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
  );
};