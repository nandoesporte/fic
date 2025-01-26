import { Card } from "@/components/ui/card";
import { VoteButtons } from "@/components/VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuestionnaireCardProps {
  questionnaire: any;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (optionType: string) => number;
  onConfirmVotes?: () => void;
}

const MAX_SELECTIONS = 3;

export const QuestionnaireCard = ({ 
  questionnaire, 
  onVote,
  isOptionSelected,
  getSelectionCount,
  onConfirmVotes
}: QuestionnaireCardProps) => {
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

  const handleVote = (type: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    const currentCount = getSelectionCount(type);
    const isSelected = isOptionSelected(type, optionNumber);

    if (!isSelected && currentCount >= MAX_SELECTIONS) {
      toast.error(`Você já selecionou ${MAX_SELECTIONS} opções nesta seção. Remova uma seleção para escolher outra.`);
      return;
    }

    onVote(type, optionNumber);
  };

  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    const options = content.split('\n\n').filter(Boolean);
    const selectionCount = getSelectionCount(type);
    const bgColorClass = getBgColor(type);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${bgColorClass}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{title}</h3>
            <span className="text-sm">
              {selectionCount}/{MAX_SELECTIONS} seleções
            </span>
          </div>
          <div className="space-y-3 mt-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
                <p className="flex-1 text-sm text-gray-900">{option}</p>
                <VoteButtons
                  isSelected={isOptionSelected(type, index + 1)}
                  onVote={() => handleVote(type, index + 1)}
                  disabled={getSelectionCount(type) >= MAX_SELECTIONS && !isOptionSelected(type, index + 1)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

        {renderSection("Pontos Fortes", questionnaire.strengths, 'strengths')}
        {renderSection("Desafios", questionnaire.challenges, 'challenges')}
        {renderSection("Oportunidades", questionnaire.opportunities, 'opportunities')}

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