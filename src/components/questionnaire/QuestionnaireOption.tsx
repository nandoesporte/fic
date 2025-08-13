
import { VoteButtons } from "@/components/VoteButtons";

interface QuestionnaireOptionProps {
  option: string;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onVote: () => void;
  disabled: boolean;
}

export const QuestionnaireOption = ({
  option,
  isActive,
  isSelected,
  onVote,
  disabled
}: QuestionnaireOptionProps) => {
  const isDisabled = disabled;
  return (
    <div 
      className={`flex items-center justify-between gap-4 p-4 rounded-lg border bg-card shadow-sm transition-colors hover:bg-muted/50 ${isDisabled ? 'opacity-60' : ''}`}
    >
      <p className="flex-1 text-sm text-card-foreground leading-relaxed">{option}</p>
      <div className="shrink-0">
        <VoteButtons
          isSelected={isSelected}
          onVote={onVote}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
