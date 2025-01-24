import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BackupListProps {
  backups: any[];
  isLoading: boolean;
  onDownload: (backup: any) => void;
  onDelete: (backupId: string) => Promise<void>;
}

export const BackupList = ({ backups, isLoading, onDownload, onDelete }: BackupListProps) => {
  const handleDelete = async (backupId: string) => {
    try {
      if (window.confirm('Tem certeza que deseja excluir este backup?')) {
        await onDelete(backupId);
        toast.success('Backup excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Erro ao excluir backup');
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Backups Disponíveis</h2>
      {isLoading ? (
        <p className="text-center text-gray-500">Carregando backups...</p>
      ) : backups?.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum backup encontrado</p>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {backups?.map((backup) => (
            <div
              key={backup.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-white rounded-lg border gap-3 md:gap-4"
            >
              <div>
                <h3 className="font-medium">
                  {backup.type === 'questionnaires' ? 'Questionários' : 'Votos'}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(backup.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={() => onDownload(backup)}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(backup.id)}
                  className="flex items-center justify-center gap-2"
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
  );
};