import { QuestionnaireOption } from "./QuestionnaireOption";
import { QuestionnaireSectionHeader } from "./QuestionnaireSectionHeader";

interface QuestionnaireSectionProps {
  title: string;
  content: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  statuses: string[];
  selectionCount: number;
  isOptionSelected: (optionNumber: number) => boolean;
  onVote: (optionNumber: number) => void;
}

export const QuestionnaireSection = ({
  title,
  content,
  type,
  statuses,
  selectionCount,
  isOptionSelected,
  onVote
}: QuestionnaireSectionProps) => {
  if (!content) return null;

  const options = content.split('\n\n').filter(Boolean);
  const MAX_SELECTIONS = 3;

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

  const bgColorClass = getBgColor(type);

  // Filter out inactive options for the voting page
  const activeOptions = options.filter((_, index) => statuses[index] === 'active');
  const activeStatuses = statuses.filter(status => status === 'active');

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <QuestionnaireSectionHeader 
          title={title}
          selectionCount={selectionCount}
        />
        <div className="space-y-3 mt-4">
          {activeOptions.map((option, index) => {
            const selected = isOptionSelected(index + 1);
            const isDisabled = selectionCount >= MAX_SELECTIONS && !selected;
            
            return (
              <QuestionnaireOption
                key={index}
                option={option}
                index={index}
                isActive={true} // Since we're only showing active options
                isSelected={selected}
                onVote={() => onVote(index + 1)}
                disabled={isDisabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};