import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, ClipboardList } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ViewControls } from "./questionnaire/ViewControls";
import { QuestionnaireSection } from "./questionnaire/QuestionnaireSection";

export const QuestionnaireResponses = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
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

      return questionnairesData?.map(q => ({
        ...q,
        strengths_statuses: q.strengths_statuses || 'pending,pending,pending',
        challenges_statuses: q.challenges_statuses || 'pending,pending,pending',
        opportunities_statuses: q.opportunities_statuses || 'pending,pending,pending',
        status: q.status || 'pending'
      }));
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

      const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',')
        .map((status, i) => i === index ? (status === 'active' ? 'pending' : 'active') : status);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: updateError } = await supabase
        .from('fic_questionnaires')
        .update({ 
          [`${type}_statuses`]: statuses.join(','),
          status: statuses.includes('active') ? 'active' : 'pending'
        })
        .eq('id', questionnaireId);

      if (updateError) throw updateError;

      if (statuses[index] === 'active') {
        const { error: voteError } = await supabase
          .from('questionnaire_votes')
          .insert({
            questionnaire_id: questionnaire.id,
            option_type: type,
            option_number: index + 1,
            vote_type: 'upvote',
            user_id: user.id
          });

        if (voteError && voteError.code !== '23505') {
          throw voteError;
        }
      } else {
        const { error: deleteError } = await supabase
          .from('questionnaire_votes')
          .delete()
          .match({
            questionnaire_id: questionnaire.id,
            option_type: type,
            option_number: index + 1,
            user_id: user.id
          });

        if (deleteError) throw deleteError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Toggle status error:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = [
    { title: 'Pontos Fortes', type: 'strengths' as const, bgColor: 'bg-[#228B22]' },
    { title: 'Desafios', type: 'challenges' as const, bgColor: 'bg-[#FFD700]' },
    { title: 'Oportunidades', type: 'opportunities' as const, bgColor: 'bg-[#000080]' }
  ];

  const filteredQuestionnaires = filterQuestionnaires(questionnaires || []);

  return (
    <div className="space-y-4">
      <ViewControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDimension={selectedDimension}
        setSelectedDimension={setSelectedDimension}
        dimensions={getUniqueDimensions()}
      />

      <div className="space-y-8">
        {sections.map(section => (
          <Card key={section.type} className="p-6">
            <QuestionnaireSection
              title={section.title}
              bgColor={section.bgColor}
              questionnaires={filteredQuestionnaires}
              type={section.type}
              editingLine={editingLine}
              onLineEdit={handleLineEdit}
              onLineSave={handleLineSave}
              onToggleStatus={handleToggleStatus}
              setEditingLine={setEditingLine}
            />
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