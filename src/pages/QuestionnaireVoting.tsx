// src/pages/QuestionnaireVoting.tsx
import React, { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { VotingSection } from "@/components/voting/VotingSection";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";
import { useVoteSubmission } from "@/hooks/useVoteSubmission";

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

  const voteSubmission = useVoteSubmission(userEmail);

  const handleConfirmVotes = (dimension: string) => {
    // Encontrar o questionário da dimensão
    const dimensionQuestionnaire = questionnaires?.find(q => q.dimension === dimension);
    if (!dimensionQuestionnaire) {
      console.error("Questionário da dimensão não encontrado:", dimension);
      return;
    }

    // Preparar os votos no formato esperado pelo useVoteSubmission
    const votes = [];
    const qSelection = selections[dimensionQuestionnaire.id];
    
    if (qSelection) {
      // Adicionar votos de strengths
      if (qSelection.strengths?.length > 0) {
        votes.push({
          optionType: 'strengths',
          optionNumbers: qSelection.strengths
        });
      }
      
      // Adicionar votos de challenges
      if (qSelection.challenges?.length > 0) {
        votes.push({
          optionType: 'challenges',
          optionNumbers: qSelection.challenges
        });
      }
      
      // Adicionar votos de opportunities
      if (qSelection.opportunities?.length > 0) {
        votes.push({
          optionType: 'opportunities',
          optionNumbers: qSelection.opportunities
        });
      }
    }

    // Submeter os votos
    voteSubmission.mutate({
      questionnaireId: dimensionQuestionnaire.id,
      votes,
      dimension
    });
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