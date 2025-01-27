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
    <Card className="p-6 border-[#D6BCFA] hover:border-[#9b87f5] transition-colors">
      <div className="space-y-6">
        <QuestionnaireHeader 
          dimension={questionnaire.dimension}
          createdAt={questionnaire.created_at}
        />

        <QuestionnaireSection
          title="Pontos Fortes"
          content={questionnaire.strengths}
          type="strengths"
          statuses={questionnaire.strengths_statuses?.split(',') || ['pending', 'pending', 'pending']}
          selectionCount={getSelectionCount('strengths')}
          onVote={onVote}
          isOptionSelected={isOptionSelected}
        />

        <QuestionnaireSection
          title="Desafios"
          content={questionnaire.challenges}
          type="challenges"
          statuses={questionnaire.challenges_statuses?.split(',') || ['pending', 'pending', 'pending']}
          selectionCount={getSelectionCount('challenges')}
          onVote={onVote}
          isOptionSelected={isOptionSelected}
        />

        <QuestionnaireSection
          title="Oportunidades"
          content={questionnaire.opportunities}
          type="opportunities"
          statuses={questionnaire.opportunities_statuses?.split(',') || ['pending', 'pending', 'pending']}
          selectionCount={getSelectionCount('opportunities')}
          onVote={onVote}
          isOptionSelected={isOptionSelected}
        />

        {onConfirmVotes && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={onConfirmVotes}
              disabled={!allSectionsComplete}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white"
            >
              Confirmar Votos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};