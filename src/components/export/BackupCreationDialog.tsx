import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw } from "lucide-react";

interface BackupCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  backupName: string;
  onBackupNameChange: (value: string) => void;
  onConfirm: () => void;
  isExporting: boolean;
}

export const BackupCreationDialog = ({
  isOpen,
  onOpenChange,
  backupName,
  onBackupNameChange,
  onConfirm,
  isExporting,
}: BackupCreationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => onBackupNameChange(e.target.value)}
            />
          </div>
          <Button 
            onClick={onConfirm}
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
  );
};