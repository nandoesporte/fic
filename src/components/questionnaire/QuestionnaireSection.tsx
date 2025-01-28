import { QuestionnaireOption } from "./QuestionnaireOption";
import { QuestionnaireSectionHeader } from "./QuestionnaireSectionHeader";

interface QuestionnaireSectionProps {
  title: string;
  content?: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  statuses?: string[];
  selectionCount?: number;
  isOptionSelected?: (optionNumber: number) => boolean;
  onVote?: (optionNumber: number) => void;
  questionnaires?: any[];
  editingLine?: any;
  onLineEdit?: (questionnaireId: string, type: string, index: number, value: string) => void;
  onLineSave?: (questionnaire: any) => void;
  onToggleStatus?: (questionnaireId: string, type: string, index: number, currentStatus: string) => void;
  setEditingLine?: (value: any) => void;
}

export const QuestionnaireSection = ({
  title,
  content,
  type,
  statuses = [],
  selectionCount = 0,
  isOptionSelected = () => false,
  onVote = () => {},
  questionnaires = [],
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine,
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

  const bgColorClass = getBgColor(type);
  const MAX_SELECTIONS = 3;

  // Handle voting view
  if (content) {
    const options = content.split('\n\n').filter(Boolean);
    const activeOptions = options.filter((_, index) => statuses[index] === 'active');
    const activeIndices = statuses.map((status, index) => status === 'active' ? index : -1).filter(index => index !== -1);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${bgColorClass}`}>
          <QuestionnaireSectionHeader 
            title={title}
            selectionCount={selectionCount}
          />
          <div className="space-y-3 mt-4">
            {activeOptions.map((option, index) => {
              const originalIndex = activeIndices[index];
              const selected = isOptionSelected(originalIndex + 1);
              const isDisabled = selectionCount >= MAX_SELECTIONS && !selected;
              
              return (
                <QuestionnaireOption
                  key={index}
                  option={option}
                  index={index}
                  isActive={true}
                  isSelected={selected}
                  onVote={() => onVote(originalIndex + 1)}
                  disabled={isDisabled}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Handle admin view
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {questionnaires.map((questionnaire) => {
          const content = questionnaire[type];
          if (!content) return null;

          const options = content.split('\n\n').filter(Boolean);
          const statuses = (questionnaire[`${type}_statuses`] || '').split(',');

          return options.map((option: string, index: number) => (
            <QuestionnaireOption
              key={`${questionnaire.id}-${index}`}
              option={option}
              index={index}
              isActive={statuses[index] === 'active'}
              isSelected={false}
              onVote={() => {}}
              disabled={false}
            />
          ));
        })}
      </div>
    </div>
  );
};