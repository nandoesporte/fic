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

  return (
    <div className="space-y-8">
      {sections.map(section => (
        <Card key={section.type} className="p-6">
          <QuestionnaireSection
            title={section.title}
            bgColor={section.bgColor}
            questionnaires={questionnaires}
            type={section.type}
            editingLine={editingLine}
            onLineEdit={onLineEdit}
            onLineSave={onLineSave}
            onToggleStatus={onToggleStatus}
            setEditingLine={setEditingLine}
          />
        </Card>
      ))}
    </div>
  );
};