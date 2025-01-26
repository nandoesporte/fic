import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { Loader2 } from "lucide-react";

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
  strengths: { content: string; questionnaireId: string; index: number }[];
  challenges: { content: string; questionnaireId: string; index: number }[];
  opportunities: { content: string; questionnaireId: string; index: number }[];
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
    const grouped: GroupedContent = {
      strengths: [],
      challenges: [],
      opportunities: []
    };

    questionnaires.forEach(questionnaire => {
      ['strengths', 'challenges', 'opportunities'].forEach(type => {
        const contents = questionnaire[type].split('\n\n').filter(Boolean);
        contents.forEach((content: string, index: number) => {
          grouped[type as keyof GroupedContent].push({
            content,
            questionnaireId: questionnaire.id,
            index: index + 1
          });
        });
      });
    });

    return grouped;
  };

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

  const renderSection = (title: string, items: { content: string; questionnaireId: string; index: number }[], type: 'strengths' | 'challenges' | 'opportunities') => {
    const bgColorClass = getBgColor(type);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${bgColorClass}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className="space-y-3 mt-4">
            {items.map((item, idx) => {
              const selectionCount = getSelectionCount(item.questionnaireId, type);
              return (
                <div key={idx} className="flex items-start justify-between gap-4 p-3 bg-white/90 rounded-lg">
                  <p className="flex-1 text-sm text-gray-900">{item.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {selectionCount}/3 seleções
                    </span>
                    <button
                      onClick={() => onVote(item.questionnaireId, type, item.index)}
                      disabled={selectionCount >= 3 && !isOptionSelected(item.questionnaireId, type, item.index)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isOptionSelected(item.questionnaireId, type, item.index)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      } ${
                        selectionCount >= 3 && !isOptionSelected(item.questionnaireId, type, item.index)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-primary/90'
                      }`}
                    >
                      {isOptionSelected(item.questionnaireId, type, item.index) ? 'Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const groupedContent = groupContentByType(questionnaires);

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
            {renderSection("Pontos Fortes", groupedContent.strengths, 'strengths')}
            {renderSection("Desafios", groupedContent.challenges, 'challenges')}
            {renderSection("Oportunidades", groupedContent.opportunities, 'opportunities')}
          </div>
        )}
      </div>
    </div>
  );
};