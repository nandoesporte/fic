import { useState } from "react";
import { toast } from "sonner";

type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

export const useQuestionnaireSelections = () => {
  const [selections, setSelections] = useState<VoteSelection>({});

  const handleVote = (
    questionnaireId: string, 
    optionType: 'strengths' | 'challenges' | 'opportunities', 
    optionNumber: number
  ) => {
    setSelections(prev => {
      const currentSelections = prev[questionnaireId]?.[optionType] || [];
      const isSelected = currentSelections.includes(optionNumber);

      if (isSelected) {
        return {
          ...prev,
          [questionnaireId]: {
            ...prev[questionnaireId],
            [optionType]: currentSelections.filter(num => num !== optionNumber)
          }
        };
      }

      if (currentSelections.length >= 3) {
        toast.error('Você já selecionou 3 opções nesta seção');
        return prev;
      }

      return {
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: [...currentSelections, optionNumber]
        }
      };
    });
  };

  const getSelectionCount = (questionnaireId: string, optionType: string) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.length || 0;
  };

  const isOptionSelected = (questionnaireId: string, optionType: string, optionNumber: number) => {
    return selections[questionnaireId]?.[optionType as keyof typeof selections[string]]?.includes(optionNumber) || false;
  };

  return {
    selections,
    handleVote,
    getSelectionCount,
    isOptionSelected,
    setSelections
  };
};