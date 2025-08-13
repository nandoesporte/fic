
import { VoteButtons } from "@/components/VoteButtons";

interface QuestionnaireOptionProps {
  option: string;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onVote: () => void;
  disabled: boolean;
  accent?: 'strengths' | 'challenges' | 'opportunities';
}

export const QuestionnaireOption = ({
  option,
  isActive,
  isSelected,
  onVote,
  disabled,
  accent = 'strengths',
}: QuestionnaireOptionProps) => {
  const isDisabled = disabled || !isActive;
  const accentVar = `--${accent}`;
  const baseBg = `bg-[hsl(var(${accentVar}))]/10`;
  const selectedClasses = `border-[hsl(var(${accentVar}))] ring-2 ring-[hsl(var(${accentVar}))]/30 bg-[hsl(var(${accentVar}))]/15`;
  const textColor = accent === 'strengths' || accent === 'opportunities' ? 'text-white' : 'text-foreground';
  return (
    <div
      className={`group flex items-start justify-between gap-4 rounded-xl border p-4 shadow-sm transition ${
        isDisabled ? 'opacity-60' : 'hover:shadow-md'
      } ${baseBg} ${isSelected ? selectedClasses : ''}`}
    >
      <p className={`flex-1 text-sm leading-relaxed ${textColor}`}>{option}</p>
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
