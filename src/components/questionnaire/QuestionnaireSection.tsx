import { VoteButtons } from "@/components/VoteButtons";

interface QuestionnaireSectionProps {
  title: string;
  content: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  selectionCount: number;
  onVote: (type: 'strengths' | 'challenges' | 'opportunities', index: number) => void;
  isOptionSelected: (type: string, index: number) => boolean;
  maxSelections: number;
}

export const QuestionnaireSection = ({
  title,
  content,
  type,
  selectionCount,
  onVote,
  isOptionSelected,
  maxSelections,
}: QuestionnaireSectionProps) => {
  const getBgColor = (type: string) => {
    switch (type) {
      case 'strengths':
        return 'bg-[#228B22] text-white';
      case 'challenges':
        return 'bg-[#FFD700] text-gray-900';
      case 'opportunities':
        return 'bg-[#000080] text-white';
      default:
        return '';
    }
  };

  const options = content.split('\n\n').filter(Boolean);
  const bgColorClass = getBgColor(type);

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm">
            {selectionCount}/3 seleções
          </span>
        </div>
        <div className="space-y-3 mt-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
              <p className="flex-1 text-sm text-gray-900">{option}</p>
              <VoteButtons
                isSelected={isOptionSelected(type, index + 1)}
                onVote={() => onVote(type, index + 1)}
                disabled={selectionCount >= maxSelections && !isOptionSelected(type, index + 1)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};