import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBackupOperations = () => {
  const queryClient = useQueryClient();

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
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-backups'] });
      toast.success('Backup excluído com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting backup:', error);
      toast.error('Erro ao excluir backup');
    }
  });

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await deleteBackupMutation.mutateAsync(backupId);
    } catch (error) {
      console.error('Error in handleDeleteBackup:', error);
    }
  };

  return {
    backups,
    isLoading,
    handleDeleteBackup,
  };
};