import { QuestionnaireOption } from "./QuestionnaireOption";
import { QuestionnaireSectionHeader } from "./QuestionnaireSectionHeader";

interface QuestionnaireSectionProps {
  title: string;
  content: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  statuses: string[];
  selectionCount: number;
  onVote: (type: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (type: string, optionNumber: number) => boolean;
}

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

export const QuestionnaireSection = ({
  title,
  content,
  type,
  statuses,
  selectionCount,
  onVote,
  isOptionSelected
}: QuestionnaireSectionProps) => {
  if (!content) return null;
  
  const options = content.split('\n\n').filter(Boolean);
  const bgColorClass = getBgColor(type);

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <QuestionnaireSectionHeader 
          title={title}
          selectionCount={selectionCount}
        />
        <div className="space-y-3 mt-4">
          {options.map((option, index) => {
            const isActive = statuses[index] === 'active';
            const selected = isOptionSelected(type, index + 1);
            
            return (
              <QuestionnaireOption
                key={index}
                option={option}
                index={index}
                isActive={isActive}
                isSelected={selected}
                onVote={() => onVote(type, index + 1)}
                disabled={selectionCount >= MAX_SELECTIONS && !selected}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};