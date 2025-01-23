import { Card } from "@/components/ui/card";
import { VoteButtons } from "@/components/VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuestionnaireCardProps {
  questionnaire: any;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  isOptionSelected: (optionType: string, optionNumber: number) => boolean;
  getSelectionCount: (optionType: string) => number;
}

const MAX_SELECTIONS = 3;

export const QuestionnaireCard = ({ 
  questionnaire, 
  onVote,
  isOptionSelected,
  getSelectionCount
}: QuestionnaireCardProps) => {
  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    const options = content.split('\n\n').filter(Boolean);
    const selectionCount = getSelectionCount(type);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm text-gray-500">
            {selectionCount}/3 seleções
          </span>
        </div>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg">
              <p className="flex-1 text-sm">{option}</p>
              <VoteButtons
                isSelected={isOptionSelected(type, index + 1)}
                onVote={() => onVote(type, index + 1)}
                disabled={selectionCount >= MAX_SELECTIONS && !isOptionSelected(type, index + 1)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

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
      </div>
    </Card>
  );
};