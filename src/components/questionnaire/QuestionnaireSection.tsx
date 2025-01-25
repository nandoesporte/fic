import { Button } from "@/components/ui/button";
import { Edit, Check, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QuestionnaireSectionProps {
  title: string;
  bgColor: string;
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
  bgColor,
  questionnaires,
  type,
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine,
}: QuestionnaireSectionProps) => {
  const renderLine = (questionnaire: any, line: string, index: number) => {
    const isEditing = editingLine?.questionnaireId === questionnaire.id && 
                     editingLine?.type === type && 
                     editingLine?.index === index;

    const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',');
    const currentStatus = statuses[index] || 'pending';

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editingLine.value}
            onChange={(e) => setEditingLine({ ...editingLine, value: e.target.value })}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLineSave(questionnaire)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingLine(null)}
          >
            <Circle className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center">
        <p className="flex-1">{line}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLineEdit(questionnaire.id, type, index, line)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(questionnaire.id, type, index, currentStatus)}
            className={currentStatus === 'active' ? 'bg-primary/10' : ''}
          >
            {currentStatus === 'pending' ? (
              <Circle className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className={`font-medium p-2 rounded-lg ${bgColor} ${type === 'challenges' ? 'text-gray-900' : 'text-white'} mb-4`}>
        {title}
      </h3>
      <div className="space-y-6">
        {questionnaires.map((questionnaire) => (
          <div key={questionnaire.id} className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#0D9488] text-white px-2 py-1 rounded">
                {questionnaire.group || 'Sem grupo'}
              </span>
              <span className="ml-4 text-gray-500">
                <span className="font-bold text-lg">Dimensão:</span> <span className="font-bold text-lg">{questionnaire.dimension}</span>
              </span>
            </div>
            <div className="space-y-2">
              {(questionnaire[type] || '').split('\n').filter((line: string) => line.trim() !== '').map((line: string, index: number) => (
                <div key={index}>
                  {renderLine(questionnaire, line, index)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};