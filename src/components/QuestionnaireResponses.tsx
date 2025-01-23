import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Download, RefreshCw, Check, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [selectedDimension, setSelectedDimension] = useState<string>("todos");
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

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ questionnaireId, type, index, currentStatus }: { 
      questionnaireId: string; 
      type: 'strengths' | 'challenges' | 'opportunities';
      index: number;
      currentStatus: string;
    }) => {
      const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
      if (!questionnaire) return;

      const lines = splitText(questionnaire[type]);
      const statuses = lines.map((_, i) => i === index ? (currentStatus === 'pending' ? 'active' : 'pending') : 'pending');

      const { error } = await supabase
        .from('fic_questionnaires')
        .update({ 
          [`${type}_statuses`]: statuses.join(','),
          status: statuses.includes('active') ? 'active' : 'pending'
        })
        .eq('id', questionnaireId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

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

  const handleToggleStatus = (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, currentStatus: string) => {
    toggleStatusMutation.mutate({ questionnaireId, type, index, currentStatus });
  };

  const renderLine = (questionnaire: any, type: 'strengths' | 'challenges' | 'opportunities', line: string, index: number) => {
    const isEditing = editingLine?.questionnaireId === questionnaire.id && 
                     editingLine?.type === type && 
                     editingLine?.index === index;

    const statuses = (questionnaire[`${type}_statuses`] || '').split(',');
    const currentStatus = statuses[index] || 'pending';

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
            <Circle className="h-4 w-4" />
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
            onClick={() => handleToggleStatus(questionnaire.id, type, index, currentStatus)}
          >
            {currentStatus === 'pending' ? (
              <Circle className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
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

  const splitText = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim() !== '');
  };

  const getUniqueDimensions = () => {
    if (!questionnaires) return [];
    const dimensions = questionnaires.map(q => q.dimension).filter((value, index, self) => self.indexOf(value) === index);
    return dimensions;
  };

  const filterQuestionnaires = (questionnaires: any[]) => {
    if (!questionnaires) return [];
    let filtered = questionnaires;
    
    if (selectedDimension !== "todos") {
      filtered = filtered.filter(q => q.dimension === selectedDimension);
    }
    
    filtered.sort((a, b) => {
      const groupA = a.group || '';
      const groupB = b.group || '';
      return groupA.localeCompare(groupB);
    });
    
    return filtered;
  };

  const handleExport = () => {
    const filteredData = filterQuestionnaires(questionnaires || []);
    const csvContent = filteredData.map(q => {
      return {
        Dimensao: q.dimension,
        Grupo: q.group || 'Sem grupo',
        'Pontos Fortes': q.strengths.replace(/\n\n/g, ' | '),
        Desafios: q.challenges.replace(/\n\n/g, ' | '),
        Oportunidades: q.opportunities.replace(/\n\n/g, ' | '),
        'Data de Criação': new Date(q.created_at).toLocaleDateString('pt-BR')
      };
    });

    const csvString = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'questionarios.csv';
    link.click();
    toast.success('Dados exportados com sucesso!');
  };

  const handleClear = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os questionários? Esta ação não pode ser desfeita.')) {
      try {
        const { data: questionnaires, error: fetchError } = await supabase
          .from('fic_questionnaires')
          .select('*');
          
        if (fetchError) throw fetchError;

        if (questionnaires && questionnaires.length > 0) {
          const { error: backupError } = await supabase
            .from('data_backups')
            .insert({
              filename: `questionarios_${new Date().toISOString()}.json`,
              data: questionnaires,
              type: 'questionnaires'
            });
            
          if (backupError) throw backupError;
        }

        const { error: deleteError } = await supabase
          .from('fic_questionnaires')
          .delete()
          .not('id', 'is', null);

        if (deleteError) throw deleteError;
        
        queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
        toast.success('Questionários limpos com sucesso e backup criado!');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao limpar questionários');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4 mb-4">
        <Select value={selectedDimension} onValueChange={setSelectedDimension}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione uma dimensão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as dimensões</SelectItem>
            {uniqueDimensions.map((dimension) => (
              <SelectItem key={dimension} value={dimension}>
                {dimension}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filterQuestionnaires(questionnaires || []).map((questionnaire) => (
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
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium p-2 rounded-lg bg-[#228B22] text-white`}>
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
                    <h4 className={`font-medium p-2 rounded-lg bg-[#FFD700] text-gray-900`}>
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
                    <h4 className={`font-medium p-2 rounded-lg bg-[#000080] text-white`}>
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

      <div className="flex justify-end gap-4 mt-8">
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
        <Button
          variant="destructive"
          onClick={handleClear}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Limpar Tudo
        </Button>
      </div>
    </div>
  );
};
