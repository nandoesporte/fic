import { VoteButtons } from "@/components/VoteButtons";
import { getBgColor } from "@/utils/questionnaireUtils";

interface QuestionnaireSectionProps {
  title: string;
  questionnaires: any[];
  type: 'strengths' | 'challenges' | 'opportunities';
  editingLine: {
    questionnaireId: string;
    type: 'strengths' | 'challenges' | 'opportunities';
    index: number;
    value: string;
  } | null;
  onLineEdit: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, value: string) => void;
  onLineSave: (questionnaire: any) => void;
  onToggleStatus: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, currentStatus: string) => void;
  setEditingLine: (value: any) => void;
}

export const QuestionnaireSection = ({
  title,
  questionnaires,
  type,
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine
}: QuestionnaireSectionProps) => {
  const getStatusesArray = (statusesString: string | null | undefined) => {
    return statusesString?.split(',') || [];
  };

  const bgColorClass = getBgColor(type);

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <div className="space-y-3 mt-4">
          {questionnaires.map((questionnaire) => {
            const content = questionnaire[type];
            if (!content) return null;
            
            const lines = content.split('\n').filter(Boolean);
            const statuses = getStatusesArray(questionnaire[`${type}_statuses`]);

            return lines.map((line: string, index: number) => {
              const isEditing = editingLine?.questionnaireId === questionnaire.id && 
                               editingLine?.type === type && 
                               editingLine?.index === index;

              return (
                <div key={`${questionnaire.id}-${type}-${index}`} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
                  {isEditing ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingLine.value}
                        onChange={(e) => onLineEdit(questionnaire.id, type, index, e.target.value)}
                        onBlur={() => {
                          onLineSave(questionnaire);
                          setEditingLine(null);
                        }}
                        className="w-full p-2 border rounded"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p className="flex-1 text-sm text-gray-900">{line}</p>
                  )}
                  <VoteButtons
                    isSelected={statuses[index] === 'active'}
                    onVote={() => onToggleStatus(questionnaire.id, type, index, statuses[index] || 'pending')}
                  />
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};