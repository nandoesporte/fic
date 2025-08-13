
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
  const isDisabled = disabled || !isActive;
  return (
    <div 
      className={`group flex items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm transition ${isDisabled ? 'opacity-60' : 'hover:shadow-md'} ${isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : ''}`}
    >
      <p className="flex-1 text-sm text-foreground leading-relaxed">{option}</p>
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
