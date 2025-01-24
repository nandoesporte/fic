import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";

interface ExportCardProps {
  isExporting: boolean;
  onExport: () => void;
}

export const ExportCard = ({ isExporting, onExport }: ExportCardProps) => {
  return (
    <Card className="p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Exportar e Limpar Dados</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Esta ação irá criar um backup dos dados atuais e limpar as tabelas
          </p>
        </div>
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="bg-primary hover:bg-primary/90 w-full md:w-auto"
        >
          {isExporting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Exportar e Limpar
        </Button>
      </div>
    </Card>
  );
};