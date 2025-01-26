import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackupList } from "@/components/export/BackupList";
import { BackupCreationDialog } from "@/components/export/BackupCreationDialog";
import { useBackupOperations } from "@/components/backup/BackupOperations";
import { Save, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ExportData() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupType, setBackupType] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isExporting, backups, fetchBackups, handleExportAndClear, downloadBackup, deleteBackup } = useBackupOperations();

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = () => {
    handleExportAndClear(backupName);
    setIsDialogOpen(false);
    setBackupName("");
  };

  const generateAIReport = async () => {
    try {
      setIsGeneratingReport(true);
      setProgress(0);

      // Fetch all dimensions
      const { data: dimensions, error: dimensionsError } = await supabase
        .from('fic_dimensions')
        .select('*');

      if (dimensionsError) throw dimensionsError;

      // Process each dimension
      for (let i = 0; i < dimensions.length; i++) {
        const dimension = dimensions[i];
        setProgress((i / dimensions.length) * 100);

        const response = await fetch('/functions/v1/analyze-vote-backups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            dimension: dimension.identifier,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to analyze dimension ${dimension.label}`);
        }

        toast.success(`Análise concluída para dimensão ${dimension.label}`);
      }

      setProgress(100);
      toast.success('Relatório inteligente gerado com sucesso!');
    } catch (error) {
      console.error('Error generating AI report:', error);
      toast.error('Erro ao gerar relatório inteligente');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backup de Dados</h1>
        <div className="flex gap-4">
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
          <Button
            onClick={generateAIReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Gerar Relatório Inteligente
          </Button>
        </div>
      </div>

      {isGeneratingReport && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Gerando relatório...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

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