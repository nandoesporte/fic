import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dimension {
  id: string;
  label: string;
  identifier: string;
}

export function DimensionManager() {
  const [newDimension, setNewDimension] = useState("");
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(null);
  const queryClient = useQueryClient();

  const { data: dimensions, isLoading } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) {
        toast.error('Erro ao carregar dimensões');
        throw error;
      }

      return data;
    },
  });

  const addDimensionMutation = useMutation({
    mutationFn: async (label: string) => {
      const identifier = label.toLowerCase().replace(/\s+/g, '-');
      const { error } = await supabase
        .from('fic_dimensions')
        .insert([{ label, identifier }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dimensions'] });
      setNewDimension("");
      toast.success('Dimensão adicionada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao adicionar dimensão');
    },
  });

  const updateDimensionMutation = useMutation({
    mutationFn: async (dimension: Dimension) => {
      const { error } = await supabase
        .from('fic_dimensions')
        .update({ label: dimension.label })
        .eq('id', dimension.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dimensions'] });
      setEditingDimension(null);
      toast.success('Dimensão atualizada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar dimensão');
    },
  });

  const deleteDimensionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fic_dimensions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dimensions'] });
      toast.success('Dimensão excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir dimensão');
    },
  });

  const handleAddDimension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDimension.trim()) {
      toast.error('Digite o nome da dimensão');
      return;
    }
    addDimensionMutation.mutate(newDimension);
  };

  const handleUpdateDimension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDimension || !editingDimension.label.trim()) {
      toast.error('Digite o nome da dimensão');
      return;
    }
    updateDimensionMutation.mutate(editingDimension);
  };

  const handleDeleteDimension = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta dimensão?')) {
      deleteDimensionMutation.mutate(id);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Gerenciar Dimensões</h3>
      
      <form onSubmit={handleAddDimension} className="flex gap-2 mb-4">
        <Input
          placeholder="Nova dimensão"
          value={newDimension}
          onChange={(e) => setNewDimension(e.target.value)}
        />
        <Button type="submit" className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </form>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-center text-gray-500">Carregando dimensões...</p>
        ) : dimensions?.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma dimensão cadastrada</p>
        ) : (
          dimensions?.map((dimension) => (
            <div
              key={dimension.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              {editingDimension?.id === dimension.id ? (
                <form onSubmit={handleUpdateDimension} className="flex-1 flex gap-2">
                  <Input
                    value={editingDimension.label}
                    onChange={(e) =>
                      setEditingDimension({
                        ...editingDimension,
                        label: e.target.value,
                      })
                    }
                  />
                  <Button type="submit" variant="ghost" size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingDimension(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <span>{dimension.label}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDimension(dimension)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDimension(dimension.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}