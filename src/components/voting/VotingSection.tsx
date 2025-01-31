import { GroupedQuestionnaireList } from "@/components/questionnaire/GroupedQuestionnaireList";
import { Loader2 } from "lucide-react";
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

export const VotingSection = ({
  userEmail,
  questionnaires = [],
  isLoading,
  selections,
  onVote,
  onConfirmVotes
}: VotingSectionProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!questionnaires.length) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhum questionário disponível</h1>
          <p className="text-muted-foreground">
            Não há questionários ativos para votação no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Votação</h1>
          <p className="text-muted-foreground">Votando com o email: {userEmail}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Selecione exatamente 3 opções em cada seção
          </p>
        </div>

        <GroupedQuestionnaireList
          questionnaires={questionnaires}
          selections={selections}
          onVote={onVote}
          onConfirmVotes={onConfirmVotes}
        />
      </div>
    </div>
  );
};