import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
    <>
      <Card className="p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Exportar e Limpar Dados</h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Esta ação irá criar um backup dos dados atuais e limpar as tabelas
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            disabled={isExporting}
            className="bg-primary hover:bg-primary/90 w-full md:w-auto"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Exportar e Limpar
          </Button>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nome do Backup</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="backupName">Nome do backup</Label>
            <Input
              id="backupName"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="Digite um nome para o backup"
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
    </>
  );
};