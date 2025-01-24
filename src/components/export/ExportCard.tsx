import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";
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

interface ExportCardProps {
  isExporting: boolean;
  onExport: (backupName: string) => void;
}

export const ExportCard = ({ isExporting, onExport }: ExportCardProps) => {
  const [open, setOpen] = useState(false);
  const [backupName, setBackupName] = useState("");

  const handleExport = () => {
    onExport(backupName);
    setOpen(false);
    setBackupName("");
  };

  return (
    <Card className="p-4 md:p-6 mb-6">
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
          className="w-full md:w-auto"
        >
          {isExporting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Exportar e Limpar
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
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};