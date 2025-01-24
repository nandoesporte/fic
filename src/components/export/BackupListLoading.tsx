import { Loader2 } from "lucide-react";

export const BackupListLoading = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando backups...</span>
      </div>
    </div>
  );
};