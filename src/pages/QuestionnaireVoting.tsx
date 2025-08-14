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
    hasVotedInDimension,
    hasVotedQuestionnaire
  } = useQuestionnaireVoting(isEmailVerified, userEmail);

  const voteSubmission = useVoteSubmission(userEmail);

  const handleConfirmVotes = (questionnaireId: string) => {
    // Encontrar o questionário específico
    const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
    if (!questionnaire) {
      console.error("Questionário não encontrado:", questionnaireId);
      return;
    }

    // Preparar os votos no formato esperado pelo useVoteSubmission
    const votes = [];
    const qSelection = selections[questionnaireId];
    
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
      questionnaireId: questionnaireId,
      votes,
      dimension: questionnaire.dimension
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
      hasVotedQuestionnaire={hasVotedQuestionnaire}
    />
  );
};

export default QuestionnaireVoting;