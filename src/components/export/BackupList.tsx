import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Trash2, FileText, Database } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface BackupListProps {
  backups: any[];
  isLoading: boolean;
  onDownload: (backup: any) => void;
  onDelete: (backupId: string) => Promise<void>;
}

export const BackupList = ({ backups, isLoading, onDownload, onDelete }: BackupListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);

  const handleDeleteClick = (backupId: string) => {
    setSelectedBackupId(backupId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBackupId) {
      try {
        await onDelete(selectedBackupId);
      } catch (error) {
        console.error('Error in handleDelete:', error);
      } finally {
        setDeleteDialogOpen(false);
        setSelectedBackupId(null);
      }
    }
  };

  const getBackupTypeLabel = (type: string) => {
    return type === 'questionnaires' ? 'Questionários' : 'Votos';
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-semibold">Backups Disponíveis</h2>
          <p className="text-sm text-muted-foreground">
            Lista de backups salvos no sistema
          </p>
        </div>
        <Database className="h-8 w-8 text-muted-foreground/50" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-4 w-4 animate-spin" />
            <span>Carregando backups...</span>
          </div>
        </div>
      ) : backups?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhum backup encontrado</p>
          <p className="text-sm text-muted-foreground/75">
            Os backups aparecerão aqui quando você exportar dados
          </p>
        </div>
      ) : (
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
                        onClick={() => handleDeleteClick(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};