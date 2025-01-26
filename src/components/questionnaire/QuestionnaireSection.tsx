import { VoteButtons } from "@/components/VoteButtons";
import { getBgColor, MAX_SELECTIONS } from "@/utils/questionnaireUtils";
import { toast } from "sonner";

interface QuestionnaireSectionProps {
  title: string;
  content: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  isOptionSelected: (optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (optionType: string) => number;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
}

export const QuestionnaireSection = ({
  title,
  content,
  type,
  isOptionSelected,
  getSelectionCount,
  onVote,
}: QuestionnaireSectionProps) => {
  const handleVote = (optionNumber: number) => {
    const currentCount = getSelectionCount(type);
    const isSelected = isOptionSelected(type, optionNumber);

    if (!isSelected && currentCount >= MAX_SELECTIONS) {
      toast.error(`Você já selecionou ${MAX_SELECTIONS} opções nesta seção. Remova uma seleção para escolher outra.`);
      return;
    }

    onVote(type, optionNumber);
  };

  const options = content.split('\n\n').filter(Boolean);
  const selectionCount = getSelectionCount(type);
  const bgColorClass = getBgColor(type);

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm">
            {selectionCount}/{MAX_SELECTIONS} seleções
          </span>
        </div>
        <div className="space-y-3 mt-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
              <p className="flex-1 text-sm text-gray-900">{option}</p>
              <VoteButtons
                isSelected={isOptionSelected(type, index + 1)}
                onVote={() => handleVote(index + 1)}
                disabled={getSelectionCount(type) >= MAX_SELECTIONS && !isOptionSelected(type, index + 1)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};