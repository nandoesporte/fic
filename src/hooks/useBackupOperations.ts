import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

export interface Backup {
  id: string;
  filename: string;
  created_at: string;
  description?: string;
  data: any;
}

export const useBackupOperations = () => {
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);

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

  const createBackup = async (backupType: string, backupName: string) => {
    try {
      setIsExporting(true);
      
      if (backupType === "export_and_clear") {
        await handleExportAndClear(backupName);
      } else {
        await handleRegularBackup(backupType, backupName);
      }

      toast.success("Backup criado com sucesso");
      await fetchBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Erro ao criar backup");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAndClear = async (backupName: string) => {
    // First, get all the data we want to backup
    const { data: questionnairesData } = await supabase
      .from("fic_questionnaires")
      .select("*");

    const { data: votesData } = await supabase
      .from("questionnaire_votes")
      .select("*");

    const { data: registeredVotersData } = await supabase
      .from("registered_voters")
      .select("*");

    // Create the backup
    const backup = {
      id: crypto.randomUUID(),
      filename: `full_backup_${new Date().toISOString()}.json`,
      data: {
        questionnaires: questionnairesData || [],
        votes: votesData || [],
        registeredVoters: registeredVotersData || [],
      },
      type: "full_backup",
      created_by: user?.id || '',
      description: backupName || "Backup completo antes da limpeza"
    };

    // Save the backup
    const { error: backupError } = await supabase
      .from("data_backups")
      .insert(backup);

    if (backupError) throw backupError;

    // Clean up the data using the RPC function
    const { error: cleanError } = await supabase
      .rpc('clean_questionnaire_votes');

    if (cleanError) throw cleanError;

    toast.success("Dados exportados e limpos com sucesso");
  };

  const handleRegularBackup = async (backupType: string, backupName: string) => {
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
  };

  const downloadBackup = async (backup: Backup) => {
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

  const deleteBackup = async (backupId: string) => {
    try {
      const { error } = await supabase
        .from("data_backups")
        .delete()
        .eq("id", backupId);

      if (error) throw error;
      
      toast.success("Backup excluído com sucesso");
      await fetchBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      toast.error("Erro ao excluir backup");
    }
  };

  return {
    isExporting,
    backups,
    fetchBackups,
    createBackup,
    downloadBackup,
    deleteBackup
  };
};