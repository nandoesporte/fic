import { QuestionnaireCard } from "@/components/QuestionnaireCard";

interface GroupedQuestionnaireListProps {
  questionnaires: any[];
  selections: {
    [key: string]: {
      strengths: number[];
      challenges: number[];
      opportunities: number[];
    };
  };
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  onConfirmVotes: (questionnaireId: string) => void;
}

export const GroupedQuestionnaireList = ({
  questionnaires,
  selections,
  onVote,
  onConfirmVotes
}: GroupedQuestionnaireListProps) => {
  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return false;
    
    const typeSelections = questionnaireSelections[optionType as keyof typeof questionnaireSelections];
    return Array.isArray(typeSelections) && typeSelections.includes(optionNumber);
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return 0;
    
    const typeSelections = questionnaireSelections[optionType as keyof typeof questionnaireSelections];
    return Array.isArray(typeSelections) ? typeSelections.length : 0;
  };

  if (!questionnaires || questionnaires.length === 0) return null;

  return (
    <div className="space-y-6">
      {questionnaires.map((q) => (
        <QuestionnaireCard
          key={q.id}
          questionnaire={q}
          onVote={(optionType, optionNumber) => onVote(q.id, optionType, optionNumber)}
          isOptionSelected={(optionType, optionNumber) => 
            isOptionSelected(q.id, optionType, optionNumber)
          }
          getSelectionCount={(optionType) => 
            getSelectionCount(q.id, optionType)
          }
          onConfirmVotes={() => onConfirmVotes(q.id)}
        />
      ))}
    </div>
  );
};