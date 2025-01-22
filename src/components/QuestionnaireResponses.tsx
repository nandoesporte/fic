import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const QuestionnaireResponses = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar questionários');
        throw error;
      }

      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fic_questionnaires')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Questionário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
    onError: () => {
      toast.error('Erro ao excluir questionário');
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este questionário?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedQuestionnaire(id);
    // You'll need to implement the edit functionality
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getBgColor = (title: string) => {
    switch (title) {
      case "Pontos Fortes":
        return "bg-[#1A1F2C]"; // Dark green background
      case "Desafios":
        return "bg-[#FEF7CD]"; // Yellow background
      case "Oportunidades":
        return "bg-[#D3E4FD]"; // Blue background
      default:
        return "";
    }
  };

  const getTextColor = (title: string) => {
    return title === "Pontos Fortes" ? "text-white" : "text-gray-900";
  };

  return (
    <div className="space-y-4">
      {questionnaires?.map((questionnaire) => (
        <Card key={questionnaire.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <h3 className="font-medium text-lg mb-2">
                Dimensão: {questionnaire.dimension}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Nível de Satisfação</h4>
                  <p>{questionnaire.satisfaction}/5</p>
                </div>
                <div>
                  <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Pontos Fortes")} ${getTextColor("Pontos Fortes")}`}>
                    Pontos Fortes
                  </h4>
                  <p className="whitespace-pre-line mt-2">{questionnaire.strengths}</p>
                </div>
                <div>
                  <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Desafios")} ${getTextColor("Desafios")}`}>
                    Desafios
                  </h4>
                  <p className="whitespace-pre-line mt-2">{questionnaire.challenges}</p>
                </div>
                <div>
                  <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Oportunidades")} ${getTextColor("Oportunidades")}`}>
                    Oportunidades
                  </h4>
                  <p className="whitespace-pre-line mt-2">{questionnaire.opportunities}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(questionnaire.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(questionnaire.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {questionnaires?.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Nenhum questionário encontrado.
        </p>
      )}
    </div>
  );
};
