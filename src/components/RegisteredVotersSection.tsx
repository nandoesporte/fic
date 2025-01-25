import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const RegisteredVotersSection = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: voters = [], isLoading } = useQuery({
    queryKey: ["registered-voters", searchTerm],
    queryFn: async () => {
      const query = supabase
        .from("registered_voters")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query.ilike("email", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredVoters = voters.filter(
    (voter) =>
      voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (voter.name && voter.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="p-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        Cooperados Registrados
      </h2>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar por email ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <CardContent className="p-0 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Carregando...</div>
        ) : filteredVoters.length === 0 ? (
          <div className="text-center text-gray-500">
            Nenhum cooperado encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVoters.map((voter) => (
              <div
                key={voter.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {voter.name || "Nome não registrado"}
                  </h3>
                  <p className="text-sm text-gray-500">{voter.email}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(voter.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};