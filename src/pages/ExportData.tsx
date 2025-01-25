import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackupList } from "@/components/export/BackupList";
import { BackupManagement } from "@/components/export/BackupManagement";
import { analyzeBackup } from "@/components/export/BackupAnalysis";

const ExportData = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: backups, isLoading } = useQuery({
    queryKey: ['data-backups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDownloadBackup = (backup: any) => {
    const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este backup?')) {
      const { error } = await supabase
        .from('data_backups')
        .delete()
        .eq('id', backupId);
      
      if (error) {
        console.error('Error deleting backup:', error);
        return;
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
        <p className="text-gray-500 mt-2">Gerencie backups e limpe os dados do sistema</p>
      </div>

      <BackupManagement />

      <BackupList
        backups={backups || []}
        onDownload={handleDownloadBackup}
        onDelete={handleDeleteBackup}
        onAnalyze={(backup) => analyzeBackup(backup, setIsAnalyzing)}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
};

export default ExportData;