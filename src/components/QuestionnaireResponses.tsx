import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const QuestionnaireResponses = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("todos");
  const [editingLine, setEditingLine] = useState<{
    questionnaireId: string;
    type: 'strengths' | 'challenges' | 'opportunities';
    index: number;
    value: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionnairesError) {
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      return questionnairesData;
    },
  });

  const updateLineMutation = useMutation({
    mutationFn: async ({ questionnaireId, type, lines }: { 
      questionnaireId: string; 
      type: 'strengths' | 'challenges' | 'opportunities';
      lines: string[];
    }) => {
      const { error } = await supabase
        .from('fic_questionnaires')
        .update({ [type]: lines.join('\n\n') })
        .eq('id', questionnaireId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Linha atualizada com sucesso');
      setEditingLine(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar linha');
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
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleLineEdit = (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, value: string) => {
    setEditingLine({ questionnaireId, type, index, value });
  };

  const handleLineSave = (questionnaire: any) => {
    if (!editingLine) return;

    const lines = splitText(questionnaire[editingLine.type]);
    lines[editingLine.index] = editingLine.value;
    
    updateLineMutation.mutate({
      questionnaireId: editingLine.questionnaireId,
      type: editingLine.type,
      lines,
    });
  };

  const handleLineDelete = (questionnaire: any, type: 'strengths' | 'challenges' | 'opportunities', indexToDelete: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta linha?')) {
      const lines = splitText(questionnaire[type]).filter((_, index) => index !== indexToDelete);
      updateLineMutation.mutate({
        questionnaireId: questionnaire.id,
        type,
        lines,
      });
    }
  };

  const renderLine = (questionnaire: any, type: 'strengths' | 'challenges' | 'opportunities', line: string, index: number) => {
    const isEditing = editingLine?.questionnaireId === questionnaire.id && 
                     editingLine?.type === type && 
                     editingLine?.index === index;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editingLine.value}
            onChange={(e) => setEditingLine({ ...editingLine, value: e.target.value })}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLineSave(questionnaire)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingLine(null)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center">
        <p className="flex-1">{line}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLineEdit(questionnaire.id, type, index, line)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLineDelete(questionnaire, type, index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
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
        return "bg-[#228B22]";
      case "Desafios":
        return "bg-[#FFD700]";
      case "Oportunidades":
        return "bg-[#000080]";
      default:
        return "";
    }
  };

  const getTextColor = (title: string) => {
    return title === "Desafios" ? "text-gray-900" : "text-white";
  };

  const splitText = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim() !== '');
  };

  const getUniqueGroups = () => {
    if (!questionnaires) return [];
    const groups = questionnaires.map(q => q.group || 'Sem grupo').filter((value, index, self) => self.indexOf(value) === index);
    return groups;
  };

  const filterQuestionnairesByGroup = (questionnaires: any[]) => {
    if (selectedGroup === "todos") return questionnaires;
    return questionnaires.filter(q => (q.group || 'Sem grupo') === selectedGroup);
  };

  const uniqueGroups = getUniqueGroups();

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione um grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os grupos</SelectItem>
            {uniqueGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filterQuestionnairesByGroup(questionnaires || []).map((questionnaire) => (
          <Card key={questionnaire.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium text-lg">
                      Dimensão: {questionnaire.dimension}
                    </h3>
                    {questionnaire.group && (
                      <div className="mt-2 inline-block">
                        <span className="bg-black text-white px-4 py-2 rounded-lg text-xl font-semibold">
                          Grupo: {questionnaire.group}
                        </span>
                      </div>
                    )}
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
                <p className="text-sm text-gray-500 mb-4">
                  Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Pontos Fortes")} ${getTextColor("Pontos Fortes")}`}>
                      Pontos Fortes
                    </h4>
                    <div className="space-y-2 mt-2">
                      {splitText(questionnaire.strengths).map((strength, index) => (
                        <div key={index}>
                          {renderLine(questionnaire, 'strengths', strength, index)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Desafios")} ${getTextColor("Desafios")}`}>
                      Desafios
                    </h4>
                    <div className="space-y-2 mt-2">
                      {splitText(questionnaire.challenges).map((challenge, index) => (
                        <div key={index}>
                          {renderLine(questionnaire, 'challenges', challenge, index)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Oportunidades")} ${getTextColor("Oportunidades")}`}>
                      Oportunidades
                    </h4>
                    <div className="space-y-2 mt-2">
                      {splitText(questionnaire.opportunities).map((opportunity, index) => (
                        <div key={index}>
                          {renderLine(questionnaire, 'opportunities', opportunity, index)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(!questionnaires || questionnaires.length === 0) && (
        <p className="text-center text-gray-500 py-4">
          Nenhum questionário encontrado.
        </p>
      )}
    </div>
  );
};