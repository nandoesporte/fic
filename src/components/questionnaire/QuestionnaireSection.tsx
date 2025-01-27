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

const getBgColor = (type: string) => {
  switch (type) {
    case 'strengths':
      return 'bg-[#2F855A] text-white';
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
        <h3 className={`text-lg font-semibold mb-4 ${type === 'challenges' ? 'text-gray-900' : 'text-white'}`}>
          {title}
        </h3>
        {questionnaires.map((questionnaire) => (
          <div key={questionnaire.id} className="space-y-2">
            {questionnaire[type]?.split('\n\n').map((line: string, index: number) => (
              <div 
                key={`${questionnaire.id}-${index}`} 
                className={`p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${bgColorClass}`}
              >
                {editingLine?.questionnaireId === questionnaire.id && 
                 editingLine?.type === type && 
                 editingLine?.index === index ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingLine.value}
                      onChange={(e) => setEditingLine?.({
                        ...editingLine,
                        value: e.target.value
                      })}
                      className="flex-1 px-2 py-1 rounded border text-gray-900"
                      autoFocus
                    />
                    <button
                      onClick={() => onLineSave?.(questionnaire)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex-1">{line}</span>
                    {onLineEdit && onToggleStatus && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onLineEdit(questionnaire.id, type, index, line)}
                          className="p-1 hover:bg-black/10 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onToggleStatus(
                            questionnaire.id,
                            type,
                            index,
                            questionnaire[`${type}_statuses`]?.split(',')[index] || 'pending'
                          )}
                          className="p-1 hover:bg-black/10 rounded"
                        >
                          {questionnaire[`${type}_statuses`]?.split(',')[index] === 'active' ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
                disabled={selectionCount >= 3 && !selected}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};