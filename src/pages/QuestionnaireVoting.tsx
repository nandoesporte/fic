import { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { VotingSection } from "@/components/voting/VotingSection";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";
import { useVoteSubmission } from "@/hooks/useVoteSubmission";
import { toast } from "sonner";
export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  const {
    questionnaires,
    isLoading,
    selections,
    handleVote,
    setSelections,
    hasVotedInDimension
  } = useQuestionnaireVoting(isEmailVerified, userEmail);

  const submitVotesMutation = useVoteSubmission(userEmail);

  const handleConfirmVotes = async (dimension: string) => {
    const dimensionQuestionnaires = questionnaires?.filter(q => q.dimension === dimension) || [];
    if (dimensionQuestionnaires.length === 0) return;

    // Verificar se já votou nesta dimensão
    if (hasVotedInDimension(dimension)) {
      toast.error("Você já votou nesta dimensão.");
      return;
    }

    // Validar que todas as seções de todos os questionários da dimensão têm exatamente 3 seleções
    let totalStrengths = 0;
    let totalChallenges = 0; 
    let totalOpportunities = 0;

    for (const questionnaire of dimensionQuestionnaires) {
      const questionnaireSelections = selections[questionnaire.id];
      if (!questionnaireSelections) {
        toast.error("Selecione exatamente 3 opções em cada seção.");
        return;
      }

      totalStrengths += questionnaireSelections.strengths?.length || 0;
      totalChallenges += questionnaireSelections.challenges?.length || 0;
      totalOpportunities += questionnaireSelections.opportunities?.length || 0;
    }

    if (totalStrengths !== 3 || totalChallenges !== 3 || totalOpportunities !== 3) {
      toast.error("Selecione exatamente 3 opções em Pontos Fortes, Desafios e Oportunidades.");
      return;
    }

    // Submeter votos para todos os questionários da dimensão
    for (const questionnaire of dimensionQuestionnaires) {
      const questionnaireSelections = selections[questionnaire.id];
      if (questionnaireSelections) {
        const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
          optionType,
          optionNumbers,
        }));

        await submitVotesMutation.mutate({ 
          questionnaireId: questionnaire.id, 
          votes,
          dimension: questionnaire.dimension 
        });
      }
    }

    setSelections({});
  };

  const handleEmailVerified = (email: string) => {
    setUserEmail(email);
    setIsEmailVerified(true);
  };

  if (!isEmailVerified) {
    return <EmailVerification onVerified={handleEmailVerified} />;
  }

  return (
    <VotingSection
      userEmail={userEmail}
      questionnaires={questionnaires || []}
      isLoading={isLoading}
      selections={selections}
      onVote={handleVote}
      onConfirmVotes={handleConfirmVotes}
      hasVotedInDimension={hasVotedInDimension}
    />
  );
};

export default QuestionnaireVoting;
