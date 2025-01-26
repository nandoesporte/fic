import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireHeader } from "./questionnaire/QuestionnaireHeader";
import { QuestionnaireSection } from "./questionnaire/QuestionnaireSection";

interface QuestionnaireCardProps {
  questionnaire: any;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (optionType: string) => number;
  onConfirmVotes?: () => void;
}

const MAX_SELECTIONS = 3;

export const QuestionnaireCard = ({ 
  questionnaire, 
  onVote,
  isOptionSelected,
  getSelectionCount,
  onConfirmVotes
}: QuestionnaireCardProps) => {
  const allSectionsComplete = 
    getSelectionCount('strengths') === MAX_SELECTIONS &&
    getSelectionCount('challenges') === MAX_SELECTIONS &&
    getSelectionCount('opportunities') === MAX_SELECTIONS;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <QuestionnaireHeader 
          dimension={questionnaire.dimension}
          createdAt={questionnaire.created_at}
        />

        <QuestionnaireSection
          title="Pontos Fortes"
          content={questionnaire.strengths}
          type="strengths"
          selectionCount={getSelectionCount('strengths')}
          onVote={onVote}
          isOptionSelected={isOptionSelected}
          maxSelections={MAX_SELECTIONS}
        />

        <QuestionnaireSection
          title="Desafios"
          content={questionnaire.challenges}
          type="challenges"
          selectionCount={getSelectionCount('challenges')}
          onVote={onVote}
          isOptionSelected={isOptionSelected}
          maxSelections={MAX_SELECTIONS}
        />

        <QuestionnaireSection
          title="Oportunidades"
          content={questionnaire.opportunities}
          type="opportunities"
          selectionCount={getSelectionCount('opportunities')}
          onVote={onVote}
          isOptionSelected={isOptionSelected}
          maxSelections={MAX_SELECTIONS}
        />

        {onConfirmVotes && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={onConfirmVotes}
              disabled={!allSectionsComplete}
              className="bg-primary hover:bg-primary/90"
            >
              Confirmar Votos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};