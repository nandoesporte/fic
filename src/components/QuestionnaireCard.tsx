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
    
    const options = content.split('\n\n').filter(Boolean);
    const selectionCount = getSelectionCount(type);
    const bgColorClass = getBgColor(type);
    const statuses = (questionnaire[`${type}_statuses`] || 'pending,pending,pending').split(',');
    
    // Filter options to only show active ones
    const activeOptions = options.filter((_, index) => statuses[index] === 'active');
    const activeIndices = options.map((_, index) => statuses[index] === 'active' ? index : -1).filter(i => i !== -1);

    if (activeOptions.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${bgColorClass}`}>
          <QuestionnaireSectionHeader 
            title={title}
            selectionCount={selectionCount}
          />
          <div className="space-y-3 mt-4">
            {activeOptions.map((option, idx) => {
              const originalIndex = activeIndices[idx];
              const selected = isOptionSelected(type, originalIndex + 1);
              
              return (
                <QuestionnaireOption
                  key={idx}
                  option={option}
                  index={idx}
                  isActive={true}
                  isSelected={selected}
                  onVote={() => onVote(type, originalIndex + 1)}
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <Card className="p-6 border-[#D6BCFA] hover:border-[#9b87f5] transition-colors">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#6E59A5]">{questionnaire.dimension}</h2>
              {questionnaire.created_at && (
                <p className="text-sm text-[#8E9196]">
                  Enviado {formatDate(questionnaire.created_at)}
                </p>
              )}
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
              className="bg-[#F97316] hover:bg-[#EA580C] text-white"
            >
              Confirmar Votos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};