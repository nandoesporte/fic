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
  created_at?: string;
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
  // Get the first questionnaire's ID to use for voting
  const primaryQuestionnaireId = questionnaires[0]?.id;

  // Combine all questionnaires into a single object with merged sections
  const mergedQuestionnaire = questionnaires.reduce<Questionnaire>((acc, curr) => {
    return {
      id: primaryQuestionnaireId, // Use the first questionnaire's ID
      dimension: 'Todas as Dimensões',
      strengths: acc.strengths + '\n\n' + curr.strengths,
      challenges: acc.challenges + '\n\n' + curr.challenges,
      opportunities: acc.opportunities + '\n\n' + curr.opportunities,
      strengths_statuses: acc.strengths_statuses + ',' + (curr.strengths_statuses || 'pending,pending,pending'),
      challenges_statuses: acc.challenges_statuses + ',' + (curr.challenges_statuses || 'pending,pending,pending'),
      opportunities_statuses: acc.opportunities_statuses + ',' + (curr.opportunities_statuses || 'pending,pending,pending'),
      created_at: new Date().toISOString(),
    };
  }, {
    id: primaryQuestionnaireId, // Use the first questionnaire's ID
    dimension: 'Todas as Dimensões',
    strengths: '',
    challenges: '',
    opportunities: '',
    strengths_statuses: '',
    challenges_statuses: '',
    opportunities_statuses: '',
    created_at: new Date().toISOString(),
  });

  // Clean up the initial empty strings and extra commas
  mergedQuestionnaire.strengths = mergedQuestionnaire.strengths.replace(/^\n\n/, '');
  mergedQuestionnaire.challenges = mergedQuestionnaire.challenges.replace(/^\n\n/, '');
  mergedQuestionnaire.opportunities = mergedQuestionnaire.opportunities.replace(/^\n\n/, '');
  mergedQuestionnaire.strengths_statuses = mergedQuestionnaire.strengths_statuses.replace(/^,/, '');
  mergedQuestionnaire.challenges_statuses = mergedQuestionnaire.challenges_statuses.replace(/^,/, '');
  mergedQuestionnaire.opportunities_statuses = mergedQuestionnaire.opportunities_statuses.replace(/^,/, '');

  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  if (!primaryQuestionnaireId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#6E59A5]">
          {mergedQuestionnaire.dimension}
        </h2>
        <div className="grid gap-4">
          <QuestionnaireCard
            questionnaire={mergedQuestionnaire}
            onVote={(optionType, optionNumber) =>
              onVote(primaryQuestionnaireId, optionType, optionNumber)
            }
            isOptionSelected={(optionType, optionNumber) =>
              isOptionSelected(primaryQuestionnaireId, optionType, optionNumber)
            }
            getSelectionCount={(optionType) =>
              getSelectionCount(primaryQuestionnaireId, optionType)
            }
            onConfirmVotes={() => onConfirmVotes(primaryQuestionnaireId)}
          />
        </div>
      </div>
    </div>
  );
};