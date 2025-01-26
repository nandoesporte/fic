import { QuestionnaireCard } from "@/components/QuestionnaireCard";
import { Loader2 } from "lucide-react";
import { VoteSelections } from "@/types/voting";
import { Card } from "@/components/ui/card";

interface QuestionnaireListProps {
  questionnaires: any[];
  isLoading: boolean;
  selections: VoteSelections;
  onVote: (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  onConfirmVotes: (questionnaireId: string) => Promise<void>;
}

export const QuestionnaireList = ({ 
  questionnaires, 
  isLoading, 
  selections,
  onVote,
  onConfirmVotes
}: QuestionnaireListProps) => {
  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = [
    { title: 'Pontos Fortes', type: 'strengths' as const, bgColor: 'bg-[#228B22] text-white' },
    { title: 'Desafios', type: 'challenges' as const, bgColor: 'bg-[#FFD700] text-gray-900' },
    { title: 'Oportunidades', type: 'opportunities' as const, bgColor: 'bg-[#000080] text-white' }
  ];

  return (
    <div className="space-y-8">
      {sections.map(section => (
        <div key={section.type}>
          <Card className={`p-4 mb-4 ${section.bgColor}`}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
          </Card>
          <Card className="p-6">
            <div className="space-y-6">
              {questionnaires?.map((questionnaire) => (
                <div key={questionnaire.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{questionnaire.dimension}</h3>
                    <p className="text-sm text-gray-500">Grupo: {questionnaire.group || 'Sem grupo'}</p>
                  </div>
                  <QuestionnaireCard
                    questionnaire={questionnaire}
                    onVote={(optionType, optionNumber) => 
                      onVote(questionnaire.id, optionType, optionNumber)
                    }
                    isOptionSelected={(optionType, optionNumber) =>
                      isOptionSelected(questionnaire.id, optionType, optionNumber)
                    }
                    getSelectionCount={(optionType) =>
                      getSelectionCount(questionnaire.id, optionType)
                    }
                    onConfirmVotes={() => onConfirmVotes(questionnaire.id)}
                    activeSection={section.type}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};