import { Loader2 } from "lucide-react";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";

interface QuestionnaireListProps {
  questionnaires: any[];
  isLoading: boolean;
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (questionnaireId: string, optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (questionnaireId: string, optionType: string) => number;
  onConfirmVotes: (questionnaireId: string) => void;
}

export const QuestionnaireList = ({
  questionnaires,
  isLoading,
  onVote,
  isOptionSelected,
  getSelectionCount,
  onConfirmVotes,
}: QuestionnaireListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questionnaires?.map((questionnaire) => (
        <QuestionnaireCard
          key={questionnaire.id}
          questionnaire={questionnaire}
          onVote={(optionType, optionNumber) => 
            onVote(questionnaire.id, optionType, optionNumber)
          }
          isOptionSelected={(optionType, optionNumber) =>
            isOptionSelected(questionnaire.id, optionType, optionNumber)
          }
          getSelectionCount={(optionType) =>
            getSelectionCount(questionnaire.id, optionType)
          }
          onConfirmVotes={() => onConfirmVotes(questionnaire.id)}
        />
      ))}
    </div>
  );
};