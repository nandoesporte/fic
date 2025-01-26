import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

export const ExportData = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleBackupQuestionnaires = async () => {
    try {
      const { data: questionnaires } = await supabase
        .from("fic_questionnaires")
        .select("*");

      const backup = {
        id: crypto.randomUUID(),
        filename: `questionnaires_${new Date().toISOString()}.json`,
        data: questionnaires || [],
        type: "questionnaires",
        created_by: user?.id || '',
        description: "Backup of questionnaire data"
      };

      const { error } = await supabase
        .from("data_backups")
        .insert(backup);

      if (error) throw error;
      toast.success("Backup created successfully");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup");
    }
  };

  const handleBackupVotes = async () => {
    try {
      const { data: votes } = await supabase
        .from("questionnaire_votes")
        .select("*");

      const backup = {
        id: crypto.randomUUID(),
        filename: `votes_${new Date().toISOString()}.json`,
        data: votes || [],
        type: "votes",
        created_by: user?.id || '',
        description: "Backup of voting data"
      };

      const { error } = await supabase
        .from("data_backups")
        .insert(backup);

      if (error) throw error;
      toast.success("Backup created successfully");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup");
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setIsLoading(true);
      const { data: backups, error } = await supabase
        .from("data_backups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!backups || backups.length === 0) {
        toast.error("No backups found");
        return;
      }

      const latestBackup = backups[0];
      const jsonString = JSON.stringify(latestBackup.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = latestBackup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Backup downloaded successfully");
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast.error("Failed to download backup");
    } finally {
      setIsLoading(false);
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
          <div>
            <h3 className="font-medium mb-2">Download do Último Backup</h3>
            <Button onClick={handleDownloadBackup} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Baixando..." : "Baixar Backup"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExportData;