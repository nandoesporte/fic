// src/pages/QuestionnaireVoting.tsx
import React, { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { VotingSection } from "@/components/voting/VotingSection";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";
import { useVoteSubmission } from "@/hooks/useVoteSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const QuestionnaireVoting: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  
  const {
    questionnaires,
    isLoading,
    selections,
    handleVote,
    hasVotedInDimension
  } = useQuestionnaireVoting(isEmailVerified, userEmail);

  const voteSubmission = useVoteSubmission(userEmail);

  // Get available dimensions
  const { data: dimensions } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');
      if (error) throw error;
      return data;
    },
    enabled: isEmailVerified,
  });

  const handleConfirmVotes = (dimension: string) => {
    // Encontrar todos os questionários da dimensão
    const dimensionQuestionnaires = questionnaires?.filter(q => q.dimension === dimension) || [];
    if (dimensionQuestionnaires.length === 0) {
      console.error("Nenhum questionário da dimensão encontrado:", dimension);
      return;
    }

    // Preparar e submeter votos para cada questionário que tem seleções
    dimensionQuestionnaires.forEach(questionnaire => {
      const qSelection = selections[questionnaire.id];
      
      if (qSelection) {
        const votes = [];
        
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

        // Submeter os votos para este questionário específico
        if (votes.length > 0) {
          console.log(`Submitting votes for questionnaire ${questionnaire.id}:`, votes);
          voteSubmission.mutate({
            questionnaireId: questionnaire.id,
            votes,
            dimension
          });
        }
      }
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
      selectedDimension={selectedDimension}
      onDimensionChange={setSelectedDimension}
      dimensions={dimensions || []}
    />
  );
};

export default QuestionnaireVoting;