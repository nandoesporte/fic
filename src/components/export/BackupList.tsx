import { Card } from "@/components/ui/card";
import { useState } from "react";
import { BackupListHeader } from "./BackupListHeader";
import { BackupListEmpty } from "./BackupListEmpty";
import { BackupListLoading } from "./BackupListLoading";
import { BackupListTable } from "./BackupListTable";
import { DeleteBackupDialog } from "./DeleteBackupDialog";

interface BackupListProps {
  backups: any[];
  isLoading: boolean;
  onDownload: (backup: any) => void;
  onDelete: (backupId: string) => Promise<void>;
}

export const BackupList = ({ backups, isLoading, onDownload, onDelete }: BackupListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (backupId: string) => {
    setSelectedBackupId(backupId);
    setDeleteDialogOpen(true);
  };

  return (
    <Card className="p-6">
      <BackupListHeader />

      {isLoading ? (
        <BackupListLoading />
      ) : backups?.length === 0 ? (
        <BackupListEmpty />
      ) : (
        <BackupListTable
          backups={backups}
          onDownload={onDownload}
          onDeleteClick={handleDeleteClick}
          isDeleting={isDeleting}
          selectedBackupId={selectedBackupId}
        />
      )}

      <DeleteBackupDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={onDelete}
        backupId={selectedBackupId}
      />
    </Card>
  );
};