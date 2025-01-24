import { Button } from "@/components/ui/button";
import { Download, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BackupListTableProps {
  backups: any[];
  onDownload: (backup: any) => void;
  onDeleteClick: (backupId: string) => void;
  isDeleting: boolean;
  selectedBackupId: string | null;
}

export const BackupListTable = ({
  backups,
  onDownload,
  onDeleteClick,
  isDeleting,
  selectedBackupId,
}: BackupListTableProps) => {
  const getBackupTypeLabel = (type: string) => {
    return type === 'questionnaires' ? 'Questionários' : 'Votos';
  };

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {backups.map((backup) => (
            <TableRow key={backup.id}>
              <TableCell className="font-medium">
                {getBackupTypeLabel(backup.type)}
              </TableCell>
              <TableCell>{backup.filename.split('_')[0]}</TableCell>
              <TableCell>
                {new Date(backup.created_at).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(backup)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick(backup.id)}
                    disabled={isDeleting && selectedBackupId === backup.id}
                  >
                    {isDeleting && selectedBackupId === backup.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};