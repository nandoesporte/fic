import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Database } from "lucide-react";
import { BackupForm } from "@/components/export/BackupForm";
import { BackupList } from "@/components/export/BackupList";

const ExportData = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50/90">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
            <p className="text-gray-500 mt-2">Gerencie backups e limpe os dados do sistema</p>
          </div>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Exportar e Limpar Dados
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Esta ação irá criar um backup dos dados atuais, limpar as tabelas e resetar os votos
                  </p>
                </div>
                <BackupForm />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Backups Disponíveis
              </h2>
              <BackupList />
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExportData;