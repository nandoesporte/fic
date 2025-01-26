import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QuestionnaireSection } from "./questionnaire/QuestionnaireSection";
import { MAX_SELECTIONS } from "@/utils/questionnaireUtils";

interface QuestionnaireCardProps {
  questionnaire: any;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (optionType: string) => number;
  onConfirmVotes?: () => void;
}

export const QuestionnaireCard = ({ 
  questionnaire, 
  onVote,
  isOptionSelected,
  getSelectionCount,
  onConfirmVotes
}: QuestionnaireCardProps) => {
  const allSectionsComplete = 
    getSelectionCount('strengths') === MAX_SELECTIONS &&
    getSelectionCount('challenges') === MAX_SELECTIONS &&
    getSelectionCount('opportunities') === MAX_SELECTIONS;

  const sections = [
    { title: 'Pontos Fortes', type: 'strengths' as const, content: questionnaire.strengths },
    { title: 'Desafios', type: 'challenges' as const, content: questionnaire.challenges },
    { title: 'Oportunidades', type: 'opportunities' as const, content: questionnaire.opportunities }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{questionnaire.dimension}</h2>
              <p className="text-sm text-gray-500">
                Enviado {formatDistanceToNow(new Date(questionnaire.created_at), { 
                  addSuffix: true,
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
        </div>

        {sections.map(section => (
          <QuestionnaireSection
            key={section.type}
            title={section.title}
            questionnaires={[questionnaire]}
            type={section.type}
            editingLine={null}
            onLineEdit={() => {}}
            onLineSave={() => {}}
            onToggleStatus={() => {}}
            setEditingLine={() => {}}
          />
        ))}

        {onConfirmVotes && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={onConfirmVotes}
              disabled={!allSectionsComplete}
              className="bg-primary hover:bg-primary/90"
            >
              Confirmar Votos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};