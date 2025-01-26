import { VoteButtons } from "@/components/VoteButtons";
import { Button } from "@/components/ui/button";

interface QuestionnaireCardProps {
  questionnaire: any;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (optionType: string) => number;
  onConfirmVotes?: () => void;
  activeSection: 'strengths' | 'challenges' | 'opportunities';
}

const MAX_SELECTIONS = 3;

export const QuestionnaireCard = ({ 
  questionnaire, 
  onVote,
  isOptionSelected,
  getSelectionCount,
  onConfirmVotes,
  activeSection
}: QuestionnaireCardProps) => {
  const options = questionnaire[activeSection].split('\n\n').filter(Boolean);
  const selectionCount = getSelectionCount(activeSection);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">
            {selectionCount}/3 seleções
          </span>
        </div>
        {options.map((option: string, index: number) => (
          <div key={index} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg">
            <p className="flex-1 text-sm text-gray-900">{option}</p>
            <VoteButtons
              isSelected={isOptionSelected(activeSection, index + 1)}
              onVote={() => onVote(activeSection, index + 1)}
              disabled={selectionCount >= MAX_SELECTIONS && !isOptionSelected(activeSection, index + 1)}
            />
          </div>
        ))}
      </div>

      {onConfirmVotes && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={onConfirmVotes}
            disabled={selectionCount !== MAX_SELECTIONS}
            className="bg-primary hover:bg-primary/90"
          >
            Confirmar Votos
          </Button>
        </div>
      )}
    </div>
  );
};