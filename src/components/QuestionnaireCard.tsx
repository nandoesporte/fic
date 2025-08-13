
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { QuestionnaireOption } from "./questionnaire/QuestionnaireOption";
import { QuestionnaireSectionHeader } from "./questionnaire/QuestionnaireSectionHeader";
import { splitOptions } from "@/lib/splitOptions";

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
  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    if (!content) return null;
    
    const options = splitOptions(content);
    const selectionCount = getSelectionCount(type);
    
    // Get statuses from the corresponding array field
    const statusesKey = `${type}_statuses`;
    const statuses = Array.isArray(questionnaire[statusesKey]) 
      ? questionnaire[statusesKey]
      : ['pending', 'pending', 'pending'];

    // Map options with original indices and visibility (only active options are shown)
    const items = options.map((option, index) => ({
      option,
      index,
      isActive: statuses[index] === 'active'
    }));

    const visibleItems = items.filter((item) => item.isActive);

    if (visibleItems.length === 0) return null;

    return (
      <section className="space-y-4">
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <QuestionnaireSectionHeader 
            title={title}
            selectionCount={selectionCount}
          />
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {visibleItems.map(({ option, index }) => {
              const selected = isOptionSelected(type, index + 1);
              
              return (
                <QuestionnaireOption
                  key={index}
                  option={option}
                  index={index}
                  isActive={true}
                  isSelected={selected}
                  onVote={() => onVote(type, index + 1)}
                  disabled={(selectionCount >= MAX_SELECTIONS && !selected)}
                />
              );
            })}
          </div>
        </div>
      </section>
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
