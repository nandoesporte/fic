import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const RegisteredVotersSection = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: voters, isLoading } = useQuery({
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

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Cooperados Registrados</h2>
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

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando cooperados...</p>
          ) : voters?.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum cooperado encontrado</p>
          ) : (
            <div className="grid gap-4">
              {voters?.map((voter) => (
                <Card key={voter.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{voter.name || "Nome não informado"}</p>
                      <p className="text-sm text-gray-500">{voter.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Registrado em {format(new Date(voter.created_at), "dd/MM/yyyy")}
                    </p>
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