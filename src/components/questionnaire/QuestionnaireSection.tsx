import { Card } from "@/components/ui/card";
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

export const QuestionnaireSection = ({
  title,
  questionnaires,
  type,
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine,
}: QuestionnaireSectionProps) => {
  const splitText = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n\n').filter(line => line.trim() !== '');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-6">
        {questionnaires.map((questionnaire) => {
          const lines = splitText(questionnaire[type]);
          const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',');

          return (
            <Card key={questionnaire.id} className="p-4">
              <div className="space-y-4">
                {lines.map((line, index) => {
                  const isEditing = editingLine?.questionnaireId === questionnaire.id && 
                                  editingLine?.type === type && 
                                  editingLine?.index === index;
                  const currentStatus = statuses[index] || 'pending';

                  return (
                    <div key={index} className="flex items-start gap-4">
                      {isEditing ? (
                        <div className="flex-1">
                          <textarea
                            value={editingLine?.value}
                            onChange={(e) => setEditingLine({
                              questionnaireId: questionnaire.id,
                              type,
                              index,
                              value: e.target.value
                            })}
                            className="w-full p-2 border rounded"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingLine(null)}
                              className="px-3 py-1 text-sm bg-gray-200 rounded"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => onLineSave(questionnaire)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="flex-1">{line}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onLineEdit(questionnaire.id, type, index, line)}
                              className="px-2 py-1 text-sm bg-gray-100 rounded"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => onToggleStatus(questionnaire.id, type, index, currentStatus)}
                              className={`px-2 py-1 text-sm rounded ${
                                currentStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200'
                              }`}
                            >
                              {currentStatus === 'active' ? 'Ativo' : 'Pendente'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};