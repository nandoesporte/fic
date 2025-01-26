import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackupList } from "@/components/export/BackupList";
import { BackupCreationDialog } from "@/components/export/BackupCreationDialog";
import { useBackupOperations } from "@/components/backup/BackupOperations";
import { Save } from "lucide-react";

export default function ExportData() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupType, setBackupType] = useState<string>("");
  const { isExporting, backups, fetchBackups, handleExportAndClear, downloadBackup, deleteBackup } = useBackupOperations();

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = () => {
    handleExportAndClear(backupName);
    setIsDialogOpen(false);
    setBackupName("");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backup de Dados</h1>
        <Button
          onClick={() => {
            setBackupType("export_and_clear");
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Exportar e Limpar Dados
        </Button>
      </div>

      <BackupCreationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        backupName={backupName}
        onBackupNameChange={setBackupName}
        onConfirm={handleCreateBackup}
        isExporting={isExporting}
      />

      <BackupList
        backups={backups}
        onDownload={downloadBackup}
        onDelete={deleteBackup}
      />
    </div>
  );
}