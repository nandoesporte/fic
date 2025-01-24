import { Database } from "lucide-react";

export const BackupListHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <h2 className="text-lg md:text-xl font-semibold">Backups Disponíveis</h2>
        <p className="text-sm text-muted-foreground">
          Lista de backups salvos no sistema
        </p>
      </div>
      <Database className="h-8 w-8 text-muted-foreground/50" />
    </div>
  );
};