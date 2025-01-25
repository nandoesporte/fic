import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseBackup, Download, FileText } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";
import { useExportOperations } from "@/components/export/useExportOperations";
import { useBackupOperations } from "@/components/export/useBackupOperations";
import { useDownloadBackup } from "@/components/export/useDownloadBackup";
import { ExportCard } from "@/components/export/ExportCard";
import { BackupList } from "@/components/export/BackupList";

const ExportData = () => {
  const { backups, isLoading, handleDeleteBackup } = useBackupOperations();
  const { isExporting, handleExportAndClear } = useExportOperations();
  const { handleDownloadBackup } = useDownloadBackup();

  const totalBackups = backups?.length || 0;
  const totalQuestionnaires = backups?.filter(b => b.type === 'questionnaires').length || 0;
  const totalVotes = backups?.filter(b => b.type === 'votes').length || 0;

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="h-full px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
              <p className="text-gray-500">Gerencie backups e limpe os dados do sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={DatabaseBackup}
                title="Total de Backups"
                value={totalBackups}
                iconClassName="bg-purple-100 text-purple-600"
              />
              <StatCard
                icon={Download}
                title="Backups de Questionários"
                value={totalQuestionnaires}
                iconClassName="bg-blue-100 text-blue-600"
              />
              <StatCard
                icon={FileText}
                title="Backups de Votos"
                value={totalVotes}
                iconClassName="bg-red-100 text-red-600"
              />
            </div>

            <ExportCard 
              isExporting={isExporting} 
              onExport={handleExportAndClear} 
            />

            <Tabs defaultValue="backups" className="space-y-6">
              <TabsList className="bg-white p-1.5 rounded-lg">
                <TabsTrigger value="backups" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6">
                  Lista de Backups
                </TabsTrigger>
              </TabsList>

              <TabsContent value="backups">
                <BackupList
                  backups={backups || []}
                  isLoading={isLoading}
                  onDownload={handleDownloadBackup}
                  onDelete={handleDeleteBackup}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExportData;