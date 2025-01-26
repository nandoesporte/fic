import { Loader2 } from "lucide-react";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { useQuestionnaireData } from "@/hooks/useQuestionnaireData";
import { useQuestionnaireMutations } from "@/hooks/useQuestionnaireMutations";
import { VoteSelection } from "./VoteSelectionManager";

interface QuestionnaireListProps {
  userEmail: string;
  selections: VoteSelection;
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (questionnaireId: string, optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (questionnaireId: string, optionType: string) => number;
}

export const QuestionnaireList = ({
  userEmail,
  selections,
  onVote,
  isOptionSelected,
  getSelectionCount,
}: QuestionnaireListProps) => {
  const { data: questionnaires, isLoading } = useQuestionnaireData();
  const { submitVotesMutation } = useQuestionnaireMutations();

  const handleConfirmVotes = async (questionnaireId: string) => {
    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return;

    const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
    if (!questionnaire) return;

    const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
      optionType,
      optionNumbers,
    }));

    await submitVotesMutation.mutate({ 
      questionnaireId, 
      votes,
      dimension: questionnaire.dimension 
    });
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
          onConfirmVotes={() => handleConfirmVotes(questionnaire.id)}
        />
      ))}
    </div>
  );
};