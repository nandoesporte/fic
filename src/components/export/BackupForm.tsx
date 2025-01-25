import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const BackupForm = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleExportAndClear = async () => {
    if (!backupName.trim()) {
      toast.error('Por favor, insira um nome para o backup');
      return;
    }

    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all questionnaires
      const { data: questionnaires, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*');
      if (questionnairesError) throw questionnairesError;

      // Fetch all votes
      const { data: votes, error: votesError } = await supabase
        .from('questionnaire_votes')
        .select('*');
      if (votesError) throw votesError;

      // Create backup of questionnaires
      if (questionnaires && questionnaires.length > 0) {
        const { error: backupError } = await supabase
          .from('data_backups')
          .insert({
            filename: `${backupName}_questionarios.json`,
            data: questionnaires,
            type: 'questionnaires',
            created_by: user.id,
            description: backupName
          });
        if (backupError) throw backupError;
      }

      // Create backup of votes
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

      // Call the clean_questionnaire_votes function
      const { error: cleanError } = await supabase
        .rpc('clean_questionnaire_votes');
      if (cleanError) throw cleanError;

      queryClient.invalidateQueries({ queryKey: ['data-backups'] });
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Criar Novo Backup
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Backup</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="backupName" className="text-sm font-medium">
              Nome do Backup
            </label>
            <Input
              id="backupName"
              placeholder="Digite um nome para o backup..."
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleExportAndClear}
            disabled={isExporting || !backupName.trim()}
            className="w-full"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Confirmar Backup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};