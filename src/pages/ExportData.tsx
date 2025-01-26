import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Trash2 } from "lucide-react";
import { BackupCreationDialog } from "@/components/export/BackupCreationDialog";
import { BackupList } from "@/components/export/BackupList";
import { useBackupOperations } from "@/hooks/useBackupOperations";

export const ExportData = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupType, setBackupType] = useState("");
  
  const {
    isExporting,
    backups,
    fetchBackups,
    createBackup,
    downloadBackup,
    deleteBackup
  } = useBackupOperations();

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleBackupQuestionnaires = () => {
    setBackupType("questionnaires");
    setIsDialogOpen(true);
  };

  const handleBackupVotes = () => {
    setBackupType("votes");
    setIsDialogOpen(true);
  };

  const handleExportAndClear = () => {
    setBackupType("export_and_clear");
    setIsDialogOpen(true);
  };

  const handleConfirmBackup = async () => {
    await createBackup(backupType, backupName);
    setBackupName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Backup de Dados</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Criar Backup</h3>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleBackupQuestionnaires}>
                <Upload className="h-4 w-4 mr-2" />
                Backup Questionários
              </Button>
              <Button onClick={handleBackupVotes}>
                <Upload className="h-4 w-4 mr-2" />
                Backup Votos
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleExportAndClear}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Exportar e Limpar Dados
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <BackupList 
        backups={backups}
        onDownload={downloadBackup}
        onDelete={deleteBackup}
      />

      <BackupCreationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        backupName={backupName}
        onBackupNameChange={setBackupName}
        onConfirm={handleConfirmBackup}
        isExporting={isExporting}
      />
    </div>
  );
};

export default ExportData;