import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireSection } from "./questionnaire/QuestionnaireSection";
import { QuestionnaireHeader } from "./questionnaire/QuestionnaireHeader";

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
  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    if (!content) return null;
    
    const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',');
    const selectionCount = getSelectionCount(type);

    return (
      <QuestionnaireSection
        title={title}
        content={content}
        type={type}
        statuses={statuses}
        selectionCount={selectionCount}
        isOptionSelected={(optionNumber) => isOptionSelected(type, optionNumber)}
        onVote={(optionNumber) => onVote(type, optionNumber)}
      />
    );
  };

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

        {renderSection("Pontos Fortes", questionnaire.strengths, 'strengths')}
        {renderSection("Desafios", questionnaire.challenges, 'challenges')}
        {renderSection("Oportunidades", questionnaire.opportunities, 'opportunities')}

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