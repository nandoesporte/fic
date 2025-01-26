import { useState } from "react";
import { toast } from "sonner";

export type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

const REQUIRED_VOTES = 3;

export const useVoteSelectionManager = () => {
  const [selections, setSelections] = useState<VoteSelection>({});

  const handleVote = (
    questionnaireId: string,
    optionType: 'strengths' | 'challenges' | 'opportunities',
    optionNumber: number
  ) => {
    const currentSelections = selections[questionnaireId]?.[optionType] || [];
    const isSelected = currentSelections.includes(optionNumber);

    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: currentSelections.filter(num => num !== optionNumber)
        }
      }));
    } else {
      if (currentSelections.length >= REQUIRED_VOTES) {
        toast.error(`Você já selecionou ${REQUIRED_VOTES} opções nesta seção. Remova uma seleção para escolher outra.`);
        return;
      }

      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: [...currentSelections, optionNumber]
        }
      }));
    }
  };

  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  const validateSelections = (questionnaireId: string) => {
    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return false;

    return (
      questionnaireSelections.strengths?.length === REQUIRED_VOTES &&
      questionnaireSelections.challenges?.length === REQUIRED_VOTES &&
      questionnaireSelections.opportunities?.length === REQUIRED_VOTES
    );
  };

  return {
    selections,
    handleVote,
    isOptionSelected,
    getSelectionCount,
    validateSelections,
  };
};