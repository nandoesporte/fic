import { toast } from "sonner";

interface BackupData {
  id: string;
  filename: string;
  data: Record<string, any>[];
  type: string;
  created_at: string;
}

export const useDownloadBackup = () => {
  const convertToCSV = (data: Record<string, any>[]): string => {
    if (!data || data.length === 0) return '';
    
    // Get all possible headers from all objects
    const headers = Array.from(
      new Set(
        data.flatMap(obj => Object.keys(obj))
      )
    );

    // Create CSV rows with all possible columns
    const rows = data.map(obj => 
      headers.map(header => {
        const value = obj[header];
        // Handle different types of values
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        // Escape quotes and handle special characters
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadBackup = (backup: BackupData) => {
    try {
      if (!backup?.data || !Array.isArray(backup.data)) {
        toast.error('Formato de backup inválido');
        return;
      }

      const csvData = convertToCSV(backup.data);
      const blob = new Blob(['\ufeff' + csvData], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup baixado com sucesso');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erro ao baixar backup');
    }
  };

  return {
    handleDownloadBackup,
  };
};