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
  const groupResponsesByType = (questionnaires: any[]) => {
    const grouped = {
      strengths: [] as string[],
      challenges: [] as string[],
      opportunities: [] as string[]
    };

    questionnaires.forEach(questionnaire => {
      const strengthsLines = (questionnaire.strengths || '').split('\n\n').filter(Boolean);
      const challengesLines = (questionnaire.challenges || '').split('\n\n').filter(Boolean);
      const opportunitiesLines = (questionnaire.opportunities || '').split('\n\n').filter(Boolean);

      grouped.strengths.push(...strengthsLines);
      grouped.challenges.push(...challengesLines);
      grouped.opportunities.push(...opportunitiesLines);
    });

    return grouped;
  };

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

  const groupedResponses = groupResponsesByType(questionnaires);
  const firstQuestionnaire = questionnaires[0];

  if (!firstQuestionnaire) return null;

  return (
    <div className="space-y-6">
      <QuestionnaireCard
        questionnaire={{
          ...firstQuestionnaire,
          strengths: groupedResponses.strengths.join('\n\n'),
          challenges: groupedResponses.challenges.join('\n\n'),
          opportunities: groupedResponses.opportunities.join('\n\n')
        }}
        onVote={(optionType, optionNumber) => onVote(firstQuestionnaire.id, optionType, optionNumber)}
        isOptionSelected={(optionType, optionNumber) => 
          isOptionSelected(firstQuestionnaire.id, optionType, optionNumber)
        }
        getSelectionCount={(optionType) => 
          getSelectionCount(firstQuestionnaire.id, optionType)
        }
        onConfirmVotes={() => onConfirmVotes(firstQuestionnaire.id)}
      />
    </div>
  );
};