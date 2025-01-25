import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatabaseBackup, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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

interface ExportCardProps {
  isExporting: boolean;
  onExport: (backupName: string) => void;
}

export const ExportCard = ({ isExporting, onExport }: ExportCardProps) => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [backupName, setBackupName] = useState("");

  const handleExport = () => {
    setOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmExport = () => {
    onExport(backupName);
    setConfirmOpen(false);
    setBackupName("");
  };

  return (
    <Card className="p-6 mb-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Exportar e Limpar Dados</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Esta ação irá criar um backup dos dados atuais e limpar as tabelas
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={isExporting}
          className="w-full md:w-auto bg-primary hover:bg-primary/90"
        >
          {isExporting ? (
            <>
              <DatabaseBackup className="h-4 w-4 animate-spin mr-2" />
              Exportando...
            </>
          ) : (
            <>
              <DatabaseBackup className="h-4 w-4 mr-2" />
              Exportar e Limpar
            </>
          )}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Backup</DialogTitle>
            <DialogDescription>
              Digite um nome para identificar este backup
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="backupName">Nome do backup</Label>
            <Input
              id="backupName"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="Ex: Backup Mensal - Janeiro 2024"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={!backupName.trim()}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exportação</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div className="flex items-start gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  Esta ação irá criar um backup dos dados atuais e em seguida limpar todas as tabelas.
                  Esta operação não pode ser desfeita.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExport}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};