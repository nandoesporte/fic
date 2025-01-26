import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VotingSection } from "./VotingSection";
import { ConfirmVoteButton } from "./ConfirmVoteButton";

interface QuestionnaireSelectionManagerProps {
  questionnaire: {
    id: string;
    dimension: string;
    strengths: string;
    challenges: string;
    opportunities: string;
  };
  userEmail: string;
  onVoteSubmitted: () => void;
}

interface Selections {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
}

export const QuestionnaireSelectionManager = ({
  questionnaire,
  userEmail,
  onVoteSubmitted,
}: QuestionnaireSelectionManagerProps) => {
  const [selections, setSelections] = useState<Selections>({
    [questionnaire.id]: {
      strengths: [],
      challenges: [],
      opportunities: [],
    },
  });

  const handleOptionSelect = (
    questionnaireId: string,
    optionType: "strengths" | "challenges" | "opportunities",
    optionNumber: number
  ) => {
    if (!userEmail) {
      toast.error("Por favor, verifique seu email primeiro");
      return;
    }

    setSelections((prev) => {
      const currentSelections = prev[questionnaireId]?.[optionType] || [];
      const isSelected = currentSelections.includes(optionNumber);

      return {
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: isSelected
            ? currentSelections.filter((num) => num !== optionNumber)
            : currentSelections.length >= 3
            ? currentSelections
            : [...currentSelections, optionNumber],
        },
      };
    });
  };

  const handleConfirmVotes = async (questionnaireId: string) => {
    if (!userEmail) {
      toast.error("Por favor, verifique seu email primeiro");
      return;
    }

    const questionnaireSelections = selections[questionnaireId];
    if (!questionnaireSelections) return;

    if (
      !questionnaireSelections.strengths ||
      questionnaireSelections.strengths.length !== 3 ||
      !questionnaireSelections.challenges ||
      questionnaireSelections.challenges.length !== 3 ||
      !questionnaireSelections.opportunities ||
      questionnaireSelections.opportunities.length !== 3
    ) {
      toast.error(
        "Por favor, selecione exatamente 3 opções em cada seção antes de confirmar"
      );
      return;
    }

    try {
      const votePromises = [];

      // Process strengths votes
      for (const optionNumber of questionnaireSelections.strengths) {
        votePromises.push(
          supabase.from("questionnaire_votes").insert({
            questionnaire_id: questionnaireId,
            user_id: userEmail,
            vote_type: "upvote",
            option_type: "strengths",
            option_number: optionNumber,
          })
        );
      }

      // Process challenges votes
      for (const optionNumber of questionnaireSelections.challenges) {
        votePromises.push(
          supabase.from("questionnaire_votes").insert({
            questionnaire_id: questionnaireId,
            user_id: userEmail,
            vote_type: "upvote",
            option_type: "challenges",
            option_number: optionNumber,
          })
        );
      }

      // Process opportunities votes
      for (const optionNumber of questionnaireSelections.opportunities) {
        votePromises.push(
          supabase.from("questionnaire_votes").insert({
            questionnaire_id: questionnaireId,
            user_id: userEmail,
            vote_type: "upvote",
            option_type: "opportunities",
            option_number: optionNumber,
          })
        );
      }

      await Promise.all(votePromises);
      toast.success("Votos registrados com sucesso!");
      onVoteSubmitted();
    } catch (error) {
      console.error("Error submitting votes:", error);
      toast.error("Erro ao registrar votos. Por favor, tente novamente.");
    }
  };

  const questionnaireSelections = selections[questionnaire.id] || {
    strengths: [],
    challenges: [],
    opportunities: [],
  };

  const allSectionsComplete =
    questionnaireSelections.strengths.length === 3 &&
    questionnaireSelections.challenges.length === 3 &&
    questionnaireSelections.opportunities.length === 3;

  return (
    <div className="space-y-6">
      <VotingSection
        title="Pontos Fortes"
        options={questionnaire.strengths.split("\n\n")}
        selectedOptions={questionnaireSelections.strengths}
        onOptionSelect={(optionNumber) =>
          handleOptionSelect(questionnaire.id, "strengths", optionNumber)
        }
      />

      <VotingSection
        title="Desafios"
        options={questionnaire.challenges.split("\n\n")}
        selectedOptions={questionnaireSelections.challenges}
        onOptionSelect={(optionNumber) =>
          handleOptionSelect(questionnaire.id, "challenges", optionNumber)
        }
      />

      <VotingSection
        title="Oportunidades"
        options={questionnaire.opportunities.split("\n\n")}
        selectedOptions={questionnaireSelections.opportunities}
        onOptionSelect={(optionNumber) =>
          handleOptionSelect(questionnaire.id, "opportunities", optionNumber)
        }
      />

      <ConfirmVoteButton
        questionnaireId={questionnaire.id}
        isComplete={allSectionsComplete}
        onConfirm={handleConfirmVotes}
      />
    </div>
  );
};