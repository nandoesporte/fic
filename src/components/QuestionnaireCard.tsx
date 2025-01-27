import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { QuestionnaireOption } from "./questionnaire/QuestionnaireOption";
import { QuestionnaireSectionHeader } from "./questionnaire/QuestionnaireSectionHeader";

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
        return 'bg-[#9b87f5] text-white';
      case 'challenges':
        return 'bg-[#9b87f5] text-white';
      case 'opportunities':
        return 'bg-[#9b87f5] text-white';
      default:
        return '';
    }
  };

  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    if (!content) return null;
    
    const options = content.split('\n\n').filter(Boolean);
    const selectionCount = getSelectionCount(type);
    const bgColorClass = getBgColor(type);
    const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',');

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${bgColorClass}`}>
          <QuestionnaireSectionHeader 
            title={title}
            selectionCount={selectionCount}
          />
          <div className="space-y-3 mt-4">
            {options.map((option, index) => {
              const isActive = statuses[index] === 'active';
              const selected = isOptionSelected(type, index + 1);
              
              return (
                <QuestionnaireOption
                  key={index}
                  option={option}
                  index={index}
                  isActive={isActive}
                  isSelected={selected}
                  onVote={() => onVote(type, index + 1)}
                  disabled={selectionCount >= MAX_SELECTIONS && !selected}
                />
              );
            })}
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
    <Card className="p-6 border-[#D6BCFA] hover:border-[#9b87f5] transition-colors">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#6E59A5]">{questionnaire.dimension}</h2>
              <p className="text-sm text-[#8E9196]">
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
              className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            >
              Confirmar Votos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};