import { Loader2 } from "lucide-react";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { useQuestionnaireData } from "@/hooks/useQuestionnaireData";
import { useQuestionnaireMutations } from "@/hooks/useQuestionnaireMutations";

interface QuestionnaireListProps {
  questionnaires: any[];
  editingLine: {
    questionnaireId: string;
    type: 'strengths' | 'challenges' | 'opportunities';
    index: number;
    value: string;
  } | null;
  onLineEdit: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, value: string) => void;
  onLineSave: (questionnaire: any) => void;
  onToggleStatus: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, currentStatus: string) => void;
  setEditingLine: (value: any) => void;
}

export const QuestionnaireList = ({
  questionnaires,
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine,
}: QuestionnaireListProps) => {
  if (!questionnaires) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questionnaires.map((questionnaire) => (
        <QuestionnaireCard
          key={questionnaire.id}
          questionnaire={questionnaire}
          onVote={(optionType, optionNumber) => 
            onLineEdit(questionnaire.id, optionType, optionNumber, '')
          }
          isOptionSelected={(optionType, optionNumber) =>
            editingLine?.questionnaireId === questionnaire.id &&
            editingLine?.type === optionType &&
            editingLine?.index === optionNumber
          }
          getSelectionCount={(optionType) =>
            editingLine?.questionnaireId === questionnaire.id &&
            editingLine?.type === optionType ? 1 : 0
          }
        />
      ))}
    </div>
  );
};