
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
        return 'bg-[#228B22] text-white';
      case 'challenges':
        return 'bg-[#FFD700] text-gray-900';
      case 'opportunities':
        return 'bg-[#000080] text-white';
      default:
        return '';
    }
  };

  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    if (!content) return null;
    
    const normalized = content.replace(/\r\n/g, '\n');
    const options = (normalized.split(/\n{2,}/).length > 1 ? normalized.split(/\n{2,}/) : normalized.split('\n'))
      .map(o => o.trim())
      .filter(Boolean);
    const selectionCount = getSelectionCount(type);
    const bgColorClass = getBgColor(type);
    
    // Get statuses from the corresponding array field
    const statusesKey = `${type}_statuses`;
    const statuses = Array.isArray(questionnaire[statusesKey]) 
      ? questionnaire[statusesKey]
      : ['pending', 'pending', 'pending'];

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

          {options.some((_, i) => isOptionSelected(type, i + 1)) && (
            <div className="mt-6">
              <h4 className="text-sm font-medium opacity-90">Suas escolhas</h4>
              <div className="mt-2 space-y-3">
                {options.map((option, index) => {
                  const selected = isOptionSelected(type, index + 1);
                  if (!selected) return null;
                  return (
                    <div
                      key={`sel-${index}`}
                      className="flex items-center justify-between p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-white/10"
                    >
                      <span className="text-sm font-medium">{(option || '').trim()}</span>
                      <span className="text-xs opacity-75">Opção {index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
