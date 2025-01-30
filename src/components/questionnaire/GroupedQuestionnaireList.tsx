import { QuestionnaireCard } from "@/components/QuestionnaireCard";

interface Questionnaire {
  id: string;
  dimension: string;
  strengths: string;
  challenges: string;
  opportunities: string;
  group?: string;
  strengths_statuses?: string;
  challenges_statuses?: string;
  opportunities_statuses?: string;
}

interface GroupedQuestionnaireListProps {
  questionnaires: Questionnaire[];
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
  onConfirmVotes,
}: GroupedQuestionnaireListProps) => {
  // Group questionnaires by their group property with proper typing
  const groupedQuestionnaires = questionnaires.reduce<{ [key: string]: Questionnaire[] }>((acc, curr) => {
    const group = curr.group || 'Sem grupo';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(curr);
    return acc;
  }, {});

  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedQuestionnaires).map(([group, groupQuestionnaires]) => (
        <div key={group} className="space-y-4">
          <h2 className="text-xl font-semibold text-[#6E59A5] capitalize">
            {group.replace(/-/g, ' ')}
          </h2>
          <div className="grid gap-4">
            {groupQuestionnaires.map((questionnaire) => (
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
        </div>
      ))}
    </div>
  );
};