// src/pages/QuestionnaireVoting.tsx
import React, { useState } from "react";

type SectionType = "strengths" | "challenges" | "opportunities";

interface Questionnaire {
  id: string;
  dimension: string;
  strengths: string[];
  challenges: string[];
  opportunities: string[];
}

interface VoteSelection {
  [dimension: string]: {
    strengths: string[];
    challenges: string[];
    opportunities: string[];
  };
}

interface QuestionnaireVotingProps {
  questionnaires: Questionnaire[];
  isLoading: boolean;
  userEmail: string;
  onSubmitVotes?: (votes: {
    questionnaireId: string;
    dimension: string;
    optionType: SectionType;
    optionNumbers: number[];
  }[]) => void;
}

export const QuestionnaireVoting: React.FC<QuestionnaireVotingProps> = ({
  questionnaires,
  isLoading,
  userEmail,
  onSubmitVotes,
}) => {
  const [selections, setSelections] = useState<VoteSelection>({});
  const [votedDimensions, setVotedDimensions] = useState<Set<string>>(new Set());

  const handleVote = (questionnaireId: string, dimension: string, section: SectionType, option: string) => {
    if (votedDimensions.has(dimension)) return;

    setSelections((prev) => {
      const dimensionVotes = prev[dimension] || {
        strengths: [],
        challenges: [],
        opportunities: [],
      };

      const currentSectionVotes = dimensionVotes[section];
      const isSelected = currentSectionVotes.includes(option);

      let updatedSectionVotes;
      if (isSelected) {
        updatedSectionVotes = currentSectionVotes.filter((v) => v !== option);
      } else {
        if (currentSectionVotes.length >= 3) return prev; // Limite de 3
        updatedSectionVotes = [...currentSectionVotes, option];
      }

      return {
        ...prev,
        [dimension]: {
          ...dimensionVotes,
          [section]: updatedSectionVotes,
        },
      };
    });
  };

  const hasSelectedThreePerSection = (dimension: string) => {
    const votes = selections[dimension];
    if (!votes) return false;
    return (
      votes.strengths.length === 3 &&
      votes.challenges.length === 3 &&
      votes.opportunities.length === 3
    );
  };

  const handleConfirmVotes = () => {
    const allVotes: {
      questionnaireId: string;
      dimension: string;
      optionType: SectionType;
      optionNumbers: number[];
    }[] = [];

    for (const q of questionnaires) {
      const votes = selections[q.dimension];
      if (!votes) continue;

      ["strengths", "challenges", "opportunities"].forEach((section) => {
        const sectionVotes = votes[section as SectionType];
        const optionNumbers = sectionVotes.map((option) =>
          q[section as SectionType].indexOf(option) + 1
        );
        allVotes.push({
          questionnaireId: q.id,
          dimension: q.dimension,
          optionType: section as SectionType,
          optionNumbers,
        });
      });
    }

    if (onSubmitVotes) {
      onSubmitVotes(allVotes);
    }

    // Marca dimensões como votadas
    setVotedDimensions(
      new Set([...votedDimensions, ...Object.keys(selections)])
    );
  };

  if (isLoading) return <p>Carregando questionários...</p>;

  return (
    <div>
      <h2>Votação</h2>
      <p>Usuário: {userEmail}</p>

      {questionnaires.map((q) => {
        const alreadyVoted = votedDimensions.has(q.dimension);

        return (
          <div key={q.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <h3>Dimensão: {q.dimension}</h3>
            {["strengths", "challenges", "opportunities"].map((section) => {
              const sectionVotes = selections[q.dimension]?.[section as SectionType] || [];
              return (
                <div key={section} style={{ marginBottom: "1rem" }}>
                  <h4>{section}</h4>
                  {q[section as SectionType].map((option) => (
                    <label key={option} style={{ display: "block" }}>
                      <input
                        type="checkbox"
                        disabled={
                          alreadyVoted ||
                          (sectionVotes.length >= 3 && !sectionVotes.includes(option))
                        }
                        checked={sectionVotes.includes(option)}
                        onChange={() =>
                          handleVote(q.id, q.dimension, section as SectionType, option)
                        }
                      />
                      {option}
                    </label>
                  ))}
                  <p>Selecionados: {sectionVotes.length} / 3</p>
                </div>
              );
            })}
            {alreadyVoted && <p style={{ color: "red" }}>Você já votou nesta dimensão.</p>}
          </div>
        );
      })}

      <button
        onClick={handleConfirmVotes}
        disabled={
          questionnaires.some((q) => !hasSelectedThreePerSection(q.dimension)) ||
          Object.keys(selections).length === 0
        }
      >
        Confirmar Todos os Votos
      </button>
    </div>
  );
};
