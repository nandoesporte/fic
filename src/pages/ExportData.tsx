import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ExportCard } from "@/components/export/ExportCard";
import { BackupList } from "@/components/export/BackupList";
import { ExportDataHeader } from "@/components/export/ExportDataHeader";
import { useBackupOperations } from "@/components/export/useBackupOperations";
import { useExportOperations } from "@/components/export/useExportOperations";
import { useDownloadBackup } from "@/components/export/useDownloadBackup";

const ExportData = () => {
  const { backups, isLoading, handleDeleteBackup } = useBackupOperations();
  const { isExporting, handleExportAndClear } = useExportOperations();
  const { handleDownloadBackup } = useDownloadBackup();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <ExportDataHeader 
            title="Exportar Dados"
            description="Gerencie backups e limpe os dados do sistema"
          />

          <ExportCard 
            isExporting={isExporting} 
            onExport={handleExportAndClear} 
          />

          <BackupList
            backups={backups || []}
            isLoading={isLoading}
            onDownload={handleDownloadBackup}
            onDelete={handleDeleteBackup}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExportData;