import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Database } from "lucide-react";
import { BackupList } from "@/components/export/BackupList";
import { BackupCreationDialog } from "@/components/export/BackupCreationDialog";

export const BackupManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExportAndClear = async () => {
    if (!backupName.trim()) {
      toast.error('Por favor, insira um nome para o backup');
      return;
    }

    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*');
      if (votesError) throw votesError;

      if (votes && votes.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_votos.json`,
            data: votes,
            type: 'votes',
            created_by: user.id,
            description: backupName
          });
        if (backupError) throw backupError;
      }

      const { error: clearVotesError } = await supabase
        .from('questionnaire_votes')
        .delete()
        .not('id', 'is', null);
      if (clearVotesError) throw clearVotesError;

      toast.success('Dados exportados e limpos com sucesso!');
      setBackupName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao exportar e limpar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Exportar e Limpar Dados
          </h2>
          <p className="text-gray-500 mt-1">
            Esta ação irá criar um backup dos dados atuais e limpar as tabelas
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
        >
          <Save className="h-4 w-4 mr-2" />
          Criar Novo Backup
        </Button>
      </div>

      <BackupCreationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        backupName={backupName}
        onBackupNameChange={setBackupName}
        onConfirm={handleExportAndClear}
        isExporting={isExporting}
      />
    </Card>
  );
};