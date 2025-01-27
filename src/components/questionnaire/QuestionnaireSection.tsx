import { QuestionnaireOption } from "./QuestionnaireOption";
import { QuestionnaireSectionHeader } from "./QuestionnaireSectionHeader";
import { EditingLine } from "@/components/QuestionnaireResponses";

interface QuestionnaireSectionProps {
  title: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  questionnaires?: any[];
  content?: string;
  statuses?: string[];
  selectionCount?: number;
  onVote?: (type: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected?: (type: string, optionNumber: number) => boolean;
  editingLine?: EditingLine;
  onLineEdit?: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, value: string) => void;
  onLineSave?: (questionnaire: any) => void;
  onToggleStatus?: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, currentStatus: string) => void;
  setEditingLine?: (value: EditingLine) => void;
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
  selectionCount = 0,
  onVote,
  isOptionSelected,
  questionnaires,
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine
}: QuestionnaireSectionProps) => {
  if (!content && !questionnaires) return null;
  
  const options = content ? content.split('\n\n').filter(Boolean) : [];
  const bgColorClass = getBgColor(type);

  if (questionnaires) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        {questionnaires.map((questionnaire) => (
          <div key={questionnaire.id} className="space-y-2">
            {/* Display questionnaire content based on type */}
            {questionnaire[type]?.split('\n\n').map((line: string, index: number) => (
              <div key={`${questionnaire.id}-${index}`} className="p-4 bg-gray-800 rounded-lg text-white">
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <QuestionnaireSectionHeader 
          title={title}
          selectionCount={selectionCount}
        />
        <div className="space-y-3 mt-4">
          {options.map((option, index) => {
            const isActive = statuses?.[index] === 'active';
            const selected = isOptionSelected?.(type, index + 1);
            
            return (
              <QuestionnaireOption
                key={index}
                option={option}
                index={index}
                isActive={isActive}
                isSelected={selected}
                onVote={() => onVote?.(type, index + 1)}
                disabled={selectionCount >= MAX_SELECTIONS && !selected}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};