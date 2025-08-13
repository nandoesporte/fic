// src/pages/QuestionnaireVoting.tsx
import React, { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { VotingSection } from "@/components/voting/VotingSection";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";

export const QuestionnaireVoting: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  const {
    questionnaires,
    isLoading,
    selections,
    handleVote,
    hasVotedInDimension
  } = useQuestionnaireVoting(isEmailVerified, userEmail);

  const handleConfirmVotes = (dimension: string) => {
    console.log("Confirming votes for dimension:", dimension);
    // Implementation for confirming votes per dimension
  };

  if (!isEmailVerified) {
    return (
      <EmailVerification 
        onVerified={(email) => {
          setUserEmail(email);
          setIsEmailVerified(true);
        }}
      />
    );
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