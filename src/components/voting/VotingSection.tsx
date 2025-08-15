import { DimensionAggregatedSection } from "@/components/voting/DimensionAggregatedSection";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
  onConfirmVotes: (dimension: string) => void;
  hasVotedInDimension: (dimension: string) => boolean;
  selectedDimension: string;
  onDimensionChange: (dimension: string) => void;
  dimensions: Array<{ id: string; identifier: string; label: string; }>;
  isSubmitting?: boolean;
}

export const VotingSection = ({
  userEmail,
  questionnaires = [],
  isLoading,
  selections,
  onVote,
  onConfirmVotes,
  hasVotedInDimension,
  selectedDimension,
  onDimensionChange,
  dimensions,
  isSubmitting = false
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

  // Filter questionnaires by selected dimension
  const filteredQuestionnaires = selectedDimension === "all" 
    ? questionnaires 
    : questionnaires.filter(q => q.dimension === selectedDimension);

  const groupedByDimension = groupQuestionnairesByDimension(filteredQuestionnaires);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Votação</h1>
          <p className="text-muted-foreground">Votando com o email: {userEmail}</p>
          <p className="text-sm text-muted-foreground mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        {/* Dimension Filter */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Selecionar Dimensão</p>
              <Select value={selectedDimension} onValueChange={onDimensionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma dimensão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as dimensões</SelectItem>
                  {dimensions.map((dim) => (
                    <SelectItem key={dim.identifier} value={dim.identifier}>
                      {dim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDimension).map(([dimension, dimensionQuestionnaires]) => {
              const hasVoted = hasVotedInDimension(dimension);
              const dimensionInfo = dimensions.find(d => d.identifier === dimension);
              
              return (
                <div key={dimension} className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground capitalize">
                    {dimensionInfo?.label || dimension.replace(/-/g, ' ')}
                  </h2>
                  
                  {hasVoted ? (
                    <Card className="p-8 text-center">
                      <div className="space-y-4">
                        <div className="text-green-600">
                          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Voto já realizado!</h3>
                        <p className="text-muted-foreground">
                          Você já votou nesta dimensão: <strong>{dimensionInfo?.label || dimension}</strong>
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <DimensionAggregatedSection
                      dimension={dimension}
                      questionnaires={dimensionQuestionnaires}
                      selections={selections}
                      onVote={onVote}
                      onConfirmVotes={onConfirmVotes}
                      hasVotedInDimension={hasVotedInDimension}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(!filteredQuestionnaires || filteredQuestionnaires.length === 0) && (
          <p className="text-center text-muted-foreground py-4">
            {selectedDimension === "all" 
              ? "Nenhum questionário encontrado." 
              : "Nenhum questionário encontrado para a dimensão selecionada."
            }
          </p>
        )}
      </div>
    </div>
  );
};