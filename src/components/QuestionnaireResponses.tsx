import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ViewControls } from "./questionnaire/ViewControls";
import { QuestionnaireList } from "./questionnaire/QuestionnaireList";
import { useQuestionnaireData } from "@/hooks/useQuestionnaireData";
import { useQuestionnaireMutations } from "@/hooks/useQuestionnaireMutations";
import { toast } from "sonner";

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

  const { data: questionnaires, isLoading } = useQuestionnaireData();
  const { updateLineMutation, toggleStatusMutation } = useQuestionnaireMutations();

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

      <QuestionnaireList
        questionnaires={filteredQuestionnaires}
        editingLine={editingLine}
        onLineEdit={handleLineEdit}
        onLineSave={handleLineSave}
        onToggleStatus={handleToggleStatus}
        setEditingLine={setEditingLine}
      />

      {(!questionnaires || questionnaires.length === 0) && (
        <p className="text-center text-gray-500 py-4">
          Nenhum questionário encontrado.
        </p>
      )}
    </div>
  );
};