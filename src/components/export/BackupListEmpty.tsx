import { FileText } from "lucide-react";

export const BackupListEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">Nenhum backup encontrado</p>
      <p className="text-sm text-muted-foreground/75">
        Os backups aparecerão aqui quando você exportar dados
      </p>
    </div>
  );
};