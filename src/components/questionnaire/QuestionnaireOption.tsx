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
  return (
    <div 
      className={`flex items-start justify-between gap-4 p-3 ${
        isActive ? 'bg-primary/10' : 'bg-white/90'
      } rounded-lg transition-colors`}
    >
      <p className="flex-1 text-sm text-gray-900">{option}</p>
      <VoteButtons
        isSelected={isSelected}
        onVote={onVote}
        disabled={disabled}
      />
    </div>
  );
};