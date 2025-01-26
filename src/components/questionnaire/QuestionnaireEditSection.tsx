import { EditingLine } from "@/components/QuestionnaireResponses";

interface QuestionnaireSectionProps {
  title: string;
  questionnaires: any[];
  type: 'strengths' | 'challenges' | 'opportunities';
  editingLine: EditingLine;
  onLineEdit: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, value: string) => void;
  onLineSave: (questionnaire: any) => void;
  onToggleStatus: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', index: number, currentStatus: string) => void;
  setEditingLine: (value: EditingLine) => void;
}

export const QuestionnaireEditSection = ({
  title,
  questionnaires,
  type,
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

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="space-y-3 mt-4">
          {questionnaires.map((questionnaire) => {
            const lines = questionnaire[type]?.split('\n\n').filter(Boolean) || [];
            const statuses = (questionnaire[`${type}_statuses`] || '').split(',');

            return lines.map((line: string, index: number) => (
              <div key={`${questionnaire.id}-${index}`} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
                <p className="flex-1 text-sm text-gray-900">{line}</p>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
};