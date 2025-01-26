import { RegisteredVotersSection } from "@/components/RegisteredVotersSection";
import { Card } from "@/components/ui/card";
import { Users as UsersIcon, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";

const Users = () => {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const users = results.data.filter((user: any) => user.email);
          
          const { error } = await supabase
            .from('registered_voters')
            .insert(
              users.map((user: any) => ({
                email: user.email,
                name: user.name || null,
                id: crypto.randomUUID(),
              }))
            );

          if (error) throw error;

          toast({
            title: "Sucesso",
            description: `${users.length} usuários importados com sucesso!`,
          });

          // Reset the file input
          event.target.value = '';
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Erro ao importar usuários",
            description: error.message,
          });
        }
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao ler arquivo",
          description: error.message,
        });
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "name,email\nJoão Silva,joao@exemplo.com\nMaria Santos,maria@exemplo.com";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_usuarios.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Participantes Cadastrados</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo CSV
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
            </div>
          </div>
        </div>
        <RegisteredVotersSection />
      </div>
    </Card>
  );
};

export default Users;