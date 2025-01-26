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

        <QuestionnaireSection
          title="Pontos Fortes"
          content={questionnaire.strengths}
          type="strengths"
          isOptionSelected={isOptionSelected}
          getSelectionCount={getSelectionCount}
          onVote={onVote}
        />

        <QuestionnaireSection
          title="Desafios"
          content={questionnaire.challenges}
          type="challenges"
          isOptionSelected={isOptionSelected}
          getSelectionCount={getSelectionCount}
          onVote={onVote}
        />

        <QuestionnaireSection
          title="Oportunidades"
          content={questionnaire.opportunities}
          type="opportunities"
          isOptionSelected={isOptionSelected}
          getSelectionCount={getSelectionCount}
          onVote={onVote}
        />

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