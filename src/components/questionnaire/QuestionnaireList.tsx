import { Card } from "@/components/ui/card";
import { QuestionnaireSection } from "./QuestionnaireSection";

interface QuestionnaireListProps {
  questionnaires: any[];
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

export const QuestionnaireList = ({
  questionnaires,
  editingLine,
  onLineEdit,
  onLineSave,
  onToggleStatus,
  setEditingLine,
}: QuestionnaireListProps) => {
  const sections = [
    { title: 'Pontos Fortes', type: 'strengths' as const, bgColor: 'bg-[#228B22]' },
    { title: 'Desafios', type: 'challenges' as const, bgColor: 'bg-[#FFD700]' },
    { title: 'Oportunidades', type: 'opportunities' as const, bgColor: 'bg-[#000080]' }
  ];

  const groupQuestionnairesByType = (questionnaires: any[], type: string) => {
    return questionnaires.reduce((acc: any[], questionnaire) => {
      const lines = questionnaire[type]?.split('\n').filter((line: string) => line.trim() !== '') || [];
      const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',');
      
      lines.forEach((line: string, index: number) => {
        acc.push({
          id: questionnaire.id,
          group: questionnaire.group,
          dimension: questionnaire.dimension,
          line,
          status: statuses[index] || 'pending',
          index
        });
      });
      
      return acc;
    }, []);
  };

  return (
    <div className="space-y-8">
      {sections.map(section => (
        <Card key={section.type} className="p-6">
          <h3 className={`font-medium p-2 rounded-lg ${section.bgColor} ${section.type === 'challenges' ? 'text-gray-900' : 'text-white'} mb-4`}>
            {section.title}
          </h3>
          <div className="space-y-6">
            {groupQuestionnairesByType(questionnaires, section.type).map((item, idx) => (
              <div key={`${item.id}-${item.index}`} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#0D9488] text-white px-2 py-1 rounded">
                    {item.group || 'Sem grupo'}
                  </span>
                  <span className="ml-4 text-gray-500">
                    <span className="font-bold text-lg">Dimensão:</span>{' '}
                    <span className="font-bold text-lg">{item.dimension}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="flex-1">{item.line}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLineEdit(item.id, section.type, item.index, item.line)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleStatus(item.id, section.type, item.index, item.status)}
                      className={`p-2 hover:bg-gray-100 rounded-full ${
                        item.status === 'active' ? 'bg-primary/10' : ''
                      }`}
                    >
                      {item.status === 'pending' ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};