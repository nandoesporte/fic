import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VotingSectionProps {
  userEmail: string;
  questionnaires: any[];
  isLoading: boolean;
  selections: {
    [key: string]: {
      strengths: number[];
      challenges: number[];
      opportunities: number[];
    };
  };
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  onConfirmVotes: (questionnaireId: string) => void;
}

type GroupedContent = {
  strengths: { text: string; questionnaireId: string; index: number }[];
  challenges: { text: string; questionnaireId: string; index: number }[];
  opportunities: { text: string; questionnaireId: string; index: number }[];
};

export const VotingSection = ({
  userEmail,
  questionnaires,
  isLoading,
  selections,
  onVote,
  onConfirmVotes
}: VotingSectionProps) => {
  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  const groupContentByType = (questionnaires: any[]): GroupedContent => {
    return questionnaires.reduce((acc: GroupedContent, questionnaire) => {
      const parseContent = (content: string, type: keyof GroupedContent) => {
        const items = content.split('\n\n').filter(Boolean);
        items.forEach((text, index) => {
          acc[type].push({
            text,
            questionnaireId: questionnaire.id,
            index: index + 1
          });
        });
      };

      parseContent(questionnaire.strengths, 'strengths');
      parseContent(questionnaire.challenges, 'challenges');
      parseContent(questionnaire.opportunities, 'opportunities');

      return acc;
    }, { strengths: [], challenges: [], opportunities: [] });
  };

  const renderSection = (
    title: string,
    items: { text: string; questionnaireId: string; index: number }[],
    type: 'strengths' | 'challenges' | 'opportunities',
    bgColor: string
  ) => {
    return (
      <Card className="p-6">
        <div className={`p-4 rounded-lg ${bgColor}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <span className="text-sm text-white">
              Seleções necessárias: {getSelectionCount(questionnaires[0]?.id || '', type)}/3
            </span>
          </div>
          <div className="space-y-3 mt-4">
            {items.map((item, idx) => (
              <div key={`${item.questionnaireId}-${type}-${item.index}`} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
                <p className="flex-1 text-sm text-gray-900">{item.text}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const currentCount = getSelectionCount(item.questionnaireId, type);
                      if (currentCount < 3 || isOptionSelected(item.questionnaireId, type, item.index)) {
                        onVote(item.questionnaireId, type, item.index);
                      } else {
                        toast.error('Você já selecionou 3 opções nesta seção');
                      }
                    }}
                    disabled={getSelectionCount(item.questionnaireId, type) >= 3 && !isOptionSelected(item.questionnaireId, type, item.index)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isOptionSelected(item.questionnaireId, type, item.index)
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-600'
                    } ${
                      getSelectionCount(item.questionnaireId, type) >= 3 && !isOptionSelected(item.questionnaireId, type, item.index)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {isOptionSelected(item.questionnaireId, type, item.index) ? 'Selecionado' : 'Selecionar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  const groupedContent = groupContentByType(questionnaires || []);

  const canSubmitVotes = (questionnaireId: string) => {
    return getSelectionCount(questionnaireId, 'strengths') === 3 &&
           getSelectionCount(questionnaireId, 'challenges') === 3 &&
           getSelectionCount(questionnaireId, 'opportunities') === 3;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="text-gray-500">Votando com o email: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {renderSection("Pontos Fortes", groupedContent.strengths, 'strengths', 'bg-[#228B22]')}
            {renderSection("Desafios", groupedContent.challenges, 'challenges', 'bg-[#FFD700]')}
            {renderSection("Oportunidades", groupedContent.opportunities, 'opportunities', 'bg-[#000080]')}
            
            {questionnaires?.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={() => onConfirmVotes(questionnaires[0].id)}
                  disabled={!canSubmitVotes(questionnaires[0].id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Confirmar Votos
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};