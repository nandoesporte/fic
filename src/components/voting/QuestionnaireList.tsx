import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { Loader2 } from "lucide-react";
import { VoteSelections } from "@/types/voting";

interface QuestionnaireListProps {
  questionnaires: any[];
  isLoading: boolean;
  selections: VoteSelections;
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  onConfirmVotes: (questionnaireId: string) => Promise<void>;
}

export const QuestionnaireList = ({ 
  questionnaires, 
  isLoading, 
  selections,
  onVote,
  onConfirmVotes
}: QuestionnaireListProps) => {
  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

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