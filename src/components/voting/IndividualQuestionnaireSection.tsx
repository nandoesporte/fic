import { Button } from "@/components/ui/button";
import { QuestionnaireOption } from "@/components/questionnaire/QuestionnaireOption";
import { splitOptions } from "@/lib/splitOptions";

interface IndividualQuestionnaireSectionProps {
  questionnaire: any;
  selections: {
    [key: string]: {
      strengths: number[];
      challenges: number[];
      opportunities: number[];
    };
  };
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  onConfirmVotes: (questionnaireId: string) => void;
  hasVotedForQuestionnaire: (questionnaireId: string) => boolean;
}

const MAX_SELECTIONS = 3;

const SECTION_META = {
  strengths: {
    title: "Pontos Fortes",
    bgClass: "bg-green-50 dark:bg-green-900/20",
    textClass: "text-green-700 dark:text-green-300"
  },
  challenges: {
    title: "Desafios",
    bgClass: "bg-red-50 dark:bg-red-900/20",
    textClass: "text-red-700 dark:text-red-300"
  },
  opportunities: {
    title: "Oportunidades",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    textClass: "text-blue-700 dark:text-blue-300"
  }
};

export const IndividualQuestionnaireSection = ({
  questionnaire,
  selections,
  onVote,
  onConfirmVotes,
  hasVotedForQuestionnaire
}: IndividualQuestionnaireSectionProps) => {
  const isSelected = (optionType: string, optionNumber: number) => {
    const questionnaireSelections = selections[questionnaire.id];
    if (!questionnaireSelections) return false;
    
    const typeSelections = questionnaireSelections[optionType as keyof typeof questionnaireSelections];
    return Array.isArray(typeSelections) && typeSelections.includes(optionNumber);
  };

  const getSelectionCount = (optionType: string) => {
    const questionnaireSelections = selections[questionnaire.id];
    if (!questionnaireSelections) return 0;
    
    const typeSelections = questionnaireSelections[optionType as keyof typeof questionnaireSelections];
    return Array.isArray(typeSelections) ? typeSelections.length : 0;
  };

  const renderSection = (
    sectionType: 'strengths' | 'challenges' | 'opportunities',
    options: string | null,
    statuses: string[] | null
  ) => {
    if (!options) return null;

    const parsedOptions = splitOptions(options);
    const activeOptions = parsedOptions.filter((_, index) => 
      !statuses || statuses[index] !== 'inactive'
    );

    if (activeOptions.length === 0) return null;

    const meta = SECTION_META[sectionType];
    const selectionCount = getSelectionCount(sectionType);
    const isMaxReached = selectionCount >= MAX_SELECTIONS;

    return (
      <div key={sectionType} className={`p-4 rounded-lg border ${meta.bgClass}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-semibold ${meta.textClass}`}>
            {meta.title}
          </h4>
          <span className={`text-sm ${meta.textClass}`}>
            {selectionCount}/{MAX_SELECTIONS} selecionadas
          </span>
        </div>
        
        <div className="space-y-2">
          {activeOptions.map((option, index) => {
            const originalIndex = parsedOptions.indexOf(option);
            const optionNumber = originalIndex + 1;
            const selected = isSelected(sectionType, optionNumber);
            const disabled = !selected && isMaxReached;

            return (
              <QuestionnaireOption
                key={`${sectionType}-${optionNumber}`}
                option={option}
                index={optionNumber}
                isActive={true}
                isSelected={selected}
                disabled={disabled}
                accent={sectionType}
                onVote={() => onVote(questionnaire.id, sectionType, optionNumber)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const allSectionsComplete = 
    getSelectionCount('strengths') === MAX_SELECTIONS &&
    getSelectionCount('challenges') === MAX_SELECTIONS &&
    getSelectionCount('opportunities') === MAX_SELECTIONS;

  const hasVoted = hasVotedForQuestionnaire(questionnaire.id);

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {questionnaire.group ? `Grupo: ${questionnaire.group}` : 'Questionário'}
        </h3>
        <p className="text-sm text-muted-foreground capitalize">
          Dimensão: {questionnaire.dimension?.replace(/-/g, ' ')}
        </p>
        {hasVoted && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✓ Você já votou neste questionário
          </p>
        )}
      </div>

      {!hasVoted && (
        <>
          <div className="space-y-4 mb-6">
            {renderSection('strengths', questionnaire.strengths, questionnaire.strengths_statuses)}
            {renderSection('challenges', questionnaire.challenges, questionnaire.challenges_statuses)}
            {renderSection('opportunities', questionnaire.opportunities, questionnaire.opportunities_statuses)}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => onConfirmVotes(questionnaire.id)}
              disabled={!allSectionsComplete}
              className="min-w-[120px]"
            >
              {allSectionsComplete ? 'Confirmar Votos' : `Selecione ${MAX_SELECTIONS} opções em cada seção`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};