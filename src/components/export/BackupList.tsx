import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Database } from "lucide-react";

interface Backup {
  id: string;
  filename: string;
  created_at: string;
  description?: string;
}

interface BackupListProps {
  backups: Backup[];
  onDownload: (backup: Backup) => void;
  onDelete: (backupId: string) => void;
}

export const BackupList = ({ backups, onDownload, onDelete }: BackupListProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        Backups Disponíveis
      </h2>
      
      {backups?.length === 0 ? (
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
                <h3 className="font-medium text-lg">
                  {backup.filename}
                </h3>
                <p className="text-sm text-gray-500">
                  {backup.description || `Backup criado em ${new Date(backup.created_at).toLocaleString('pt-BR')}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(backup)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(backup.id)}
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
  );
};