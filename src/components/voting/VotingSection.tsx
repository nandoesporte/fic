import { DimensionAggregatedSection } from "@/components/voting/DimensionAggregatedSection";
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

export const VotingSection = ({
  userEmail,
  questionnaires = [],
  isLoading,
  selections,
  onVote,
  onConfirmVotes
}: VotingSectionProps) => {
  const groupQuestionnairesByDimension = (questionnaires: any[]): { [key: string]: any[] } => {
    return questionnaires.reduce((acc, curr) => {
      const dimension = curr.dimension;
      if (!acc[dimension]) {
        acc[dimension] = [];
      }
      acc[dimension].push(curr);
      return acc;
    }, {} as { [key: string]: any[] });
  };

  const groupedByDimension = groupQuestionnairesByDimension(questionnaires);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Votação</h1>
          <p className="text-muted-foreground">Votando com o email: {userEmail}</p>
          <p className="text-sm text-muted-foreground mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDimension).map(([dimension, dimensionQuestionnaires]) => (
              <div key={dimension} className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground capitalize">
                  {dimension.replace(/-/g, ' ')}
                </h2>
                <DimensionAggregatedSection
                  dimension={dimension}
                  questionnaires={dimensionQuestionnaires}
                  selections={selections}
                  onVote={onVote}
                  onConfirmVotes={onConfirmVotes}
                />
              </div>
            ))}
          </div>
        )}

        {(!questionnaires || questionnaires.length === 0) && (
          <p className="text-center text-muted-foreground py-4">
            Nenhum questionário encontrado.
          </p>
        )}
      </div>
    </div>
  );
};