import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { BackupCreationDialog } from "@/components/export/BackupCreationDialog";
import { BackupList } from "@/components/export/BackupList";

export const ExportData = () => {
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [backups, setBackups] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupType, setBackupType] = useState("");

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase
        .from("data_backups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error("Error fetching backups:", error);
      toast.error("Erro ao carregar backups");
    }
  };

  const handleBackupQuestionnaires = () => {
    setBackupType("questionnaires");
    setIsDialogOpen(true);
  };

  const handleBackupVotes = () => {
    setBackupType("votes");
    setIsDialogOpen(true);
  };

  const handleConfirmBackup = async () => {
    try {
      setIsExporting(true);
      
      const { data: sourceData } = await supabase
        .from(backupType === "questionnaires" ? "fic_questionnaires" : "questionnaire_votes")
        .select("*");

      const backup = {
        id: crypto.randomUUID(),
        filename: `${backupType}_${new Date().toISOString()}.json`,
        data: sourceData || [],
        type: backupType,
        created_by: user?.id || '',
        description: backupName
      };

      const { error } = await supabase
        .from("data_backups")
        .insert(backup);

      if (error) throw error;
      
      toast.success("Backup criado com sucesso");
      setBackupName("");
      setIsDialogOpen(false);
      fetchBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Erro ao criar backup");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      const jsonString = JSON.stringify(backup.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Backup baixado com sucesso");
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast.error("Erro ao baixar backup");
    }
  };

  const handleDeleteBackup = async (backupId) => {
    try {
      const { error } = await supabase
        .from("data_backups")
        .delete()
        .eq("id", backupId);

      if (error) throw error;
      
      toast.success("Backup excluído com sucesso");
      fetchBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      toast.error("Erro ao excluir backup");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Backup de Dados</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Criar Backup</h3>
            <div className="flex gap-4">
              <Button onClick={handleBackupQuestionnaires}>
                <Upload className="h-4 w-4 mr-2" />
                Backup Questionários
              </Button>
              <Button onClick={handleBackupVotes}>
                <Upload className="h-4 w-4 mr-2" />
                Backup Votos
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <BackupList 
        backups={backups}
        onDownload={handleDownloadBackup}
        onDelete={handleDeleteBackup}
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