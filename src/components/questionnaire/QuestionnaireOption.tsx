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
      className={`flex items-center justify-between gap-4 p-4 ${
        isActive ? 'bg-[#9b87f5]/10' : 'bg-white/90'
      } rounded-lg border border-[#D6BCFA] shadow-sm transition-colors hover:border-[#9b87f5]`}
    >
      <p className="flex-1 text-sm text-gray-900 leading-relaxed">{option}</p>
      <div className="shrink-0">
        <VoteButtons
          isSelected={isSelected}
          onVote={onVote}
          disabled={disabled}
        />
      </div>
    </div>
  );
};