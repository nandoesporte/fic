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
  background_color?: string;
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
      
      // Check if dimension with same label or identifier already exists
      const { data: existingDimension } = await supabase
        .from('fic_dimensions')
        .select('id')
        .or(`label.eq.${label},identifier.eq.${identifier}`)
        .maybeSingle();

      if (existingDimension) {
        throw new Error('Já existe uma dimensão com este nome');
      }

      const { error } = await supabase
        .from('fic_dimensions')
        .insert([{ label, identifier, background_color: '#F1F0FB' }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dimensions'] });
      setNewDimension("");
      toast.success('Dimensão adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao adicionar dimensão');
    },
  });

  const updateDimensionMutation = useMutation({
    mutationFn: async (dimension: Dimension) => {
      // Check if another dimension with same label exists (excluding current one)
      const { data: existingDimension } = await supabase
        .from('fic_dimensions')
        .select('id')
        .eq('label', dimension.label)
        .neq('id', dimension.id)
        .maybeSingle();

      if (existingDimension) {
        throw new Error('Já existe uma dimensão com este nome');
      }

      const { error } = await supabase
        .from('fic_dimensions')
        .update({ 
          label: dimension.label,
          background_color: dimension.background_color 
        })
        .eq('id', dimension.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dimensions'] });
      setEditingDimension(null);
      toast.success('Dimensão atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar dimensão');
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
          disabled={addDimensionMutation.isPending}
        />
        <Button 
          type="submit" 
          className="shrink-0"
          disabled={addDimensionMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addDimensionMutation.isPending ? 'Adicionando...' : 'Adicionar'}
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
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: dimension.background_color }}
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
                    disabled={updateDimensionMutation.isPending}
                  />
                  <Input
                    type="color"
                    value={editingDimension.background_color || '#F1F0FB'}
                    onChange={(e) =>
                      setEditingDimension({
                        ...editingDimension,
                        background_color: e.target.value,
                      })
                    }
                    className="w-16 p-1 h-10"
                    disabled={updateDimensionMutation.isPending}
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    size="icon"
                    disabled={updateDimensionMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingDimension(null)}
                    disabled={updateDimensionMutation.isPending}
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