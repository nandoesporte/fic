import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, Trash2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const RegisteredVotersSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const { data: voters, isLoading, refetch } = useQuery({
    queryKey: ["registered-voters", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("registered_voters")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleAddVoter = async () => {
    if (!newEmail) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira um email válido.",
      });
      return;
    }

    const { error } = await supabase
      .from("registered_voters")
      .insert([{ email: newEmail, name: newName || null }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar participante",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Participante adicionado com sucesso!",
    });
    setNewEmail("");
    setNewName("");
    refetch();
  };

  const handleDeleteVoter = async (id: string) => {
    const { error } = await supabase
      .from("registered_voters")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover participante",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Participante removido com sucesso!",
    });
    refetch();
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Participantes Registrados</h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do participante"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder="Email do participante"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button onClick={handleAddVoter}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando participantes...</p>
          ) : voters?.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum participante encontrado</p>
          ) : (
            <div className="grid gap-4">
              {voters?.map((voter) => (
                <Card key={voter.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{voter.name || "Nome não informado"}</p>
                      <p className="text-sm text-gray-500">{voter.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-500">
                        Registrado em {format(new Date(voter.created_at), "dd/MM/yyyy")}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVoter(voter.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};