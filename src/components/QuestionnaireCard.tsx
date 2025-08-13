
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
  const getAccentClass = (type: string) => {
    switch (type) {
      case 'strengths':
        return 'bg-[hsl(var(--strengths))]';
      case 'challenges':
        return 'bg-[hsl(var(--challenges))]';
      case 'opportunities':
        return 'bg-[hsl(var(--opportunities))]';
      default:
        return 'bg-primary';
    }
  };

  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    if (!content) return null;
    
    const options = splitOptions(content);
    const selectionCount = getSelectionCount(type);

    // Get statuses from the corresponding array field
    const statusesKey = `${type}_statuses`;
    const statuses = Array.isArray(questionnaire[statusesKey]) 
      ? questionnaire[statusesKey]
      : ['pending', 'pending', 'pending'];

    // Keep original indexes to vote correctly but hide non-active
    const entries = options
      .map((option, index) => ({ option, index, status: statuses[index] }))
      .filter((e) => e.status === 'active');

    if (entries.length === 0) return null;

    const accentClass = getAccentClass(type);

      return (
        <section className={`rounded-2xl ${accentClass} p-3 sm:p-4 shadow-sm`}>
          <div className={`px-4 py-3 ${type === 'challenges' ? 'text-foreground' : 'text-white'}`}>
            <QuestionnaireSectionHeader
              title={title}
              selectionCount={selectionCount}
            />
          </div>
          <div className="p-2 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {entries.map(({ option, index }) => {
                const selected = isOptionSelected(type, index + 1);
                return (
                  <QuestionnaireOption
                    key={index}
                    option={option}
                    index={index}
                    isActive={true}
                    isSelected={selected}
                    onVote={() => onVote(type, index + 1)}
                    disabled={selectionCount >= MAX_SELECTIONS && !selected}
                    accent={type}
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
              <p className="text-sm text-muted-foreground">
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
            >
              Confirmar Votos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
