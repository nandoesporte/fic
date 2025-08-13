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
    setSelections
  } = useQuestionnaireVoting(isEmailVerified);

  const submitVotesMutation = useVoteSubmission(userEmail);

  const handleConfirmVotes = async (questionnaireId: string) => {
    const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
    if (!questionnaire) return;

    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) {
      toast.error("Selecione exatamente 3 opções em cada seção.");
      return;
    }

    const strengthsCount = questionnaireSelections.strengths?.length || 0;
    const challengesCount = questionnaireSelections.challenges?.length || 0;
    const opportunitiesCount = questionnaireSelections.opportunities?.length || 0;

    if (strengthsCount !== 3 || challengesCount !== 3 || opportunitiesCount !== 3) {
      toast.error("Selecione exatamente 3 opções em Pontos Fortes, Desafios e Oportunidades.");
      return;
    }

    const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
      optionType,
      optionNumbers,
    }));

    await submitVotesMutation.mutate({ 
      questionnaireId, 
      votes,
      dimension: questionnaire.dimension 
    });

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
    />
  );
};

export default QuestionnaireVoting;
