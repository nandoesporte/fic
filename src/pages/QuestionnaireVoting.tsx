// src/pages/QuestionnaireVoting.tsx
import React, { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";
import { splitOptions } from "@/lib/splitOptions";

type SectionType = "strengths" | "challenges" | "opportunities";

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

  const [votedDimensions, setVotedDimensions] = useState<Set<string>>(new Set());
  const handleVoteClick = (questionnaireId: string, dimension: string, section: SectionType, optionIndex: number) => {
    if (hasVotedInDimension(dimension)) return;
    handleVote(questionnaireId, section, optionIndex + 1);
  };

  const hasSelectedThreePerSection = (questionnaireId: string) => {
    const qSelections = selections[questionnaireId];
    if (!qSelections) return false;
    return (
      qSelections.strengths.length === 3 &&
      qSelections.challenges.length === 3 &&
      qSelections.opportunities.length === 3
    );
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

  if (isLoading) return <p>Carregando questionários...</p>;

  return (
    <div>
      <h2>Votação</h2>
      <p>Usuário: {userEmail}</p>

      {questionnaires?.map((q) => {
        const alreadyVoted = hasVotedInDimension(q.dimension);
        const qSelections = selections[q.id] || { strengths: [], challenges: [], opportunities: [] };

        return (
          <div key={q.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <h3>Dimensão: {q.dimension}</h3>
            {(["strengths", "challenges", "opportunities"] as SectionType[]).map((section) => {
              const sectionVotes = qSelections[section] || [];
              const sectionData = q[section];
              const options = splitOptions(sectionData);
              
              return (
                <div key={section} style={{ marginBottom: "1rem" }}>
                  <h4>{section}</h4>
                  {options.map((option, index) => (
                    <label key={option} style={{ display: "block" }}>
                      <input
                        type="checkbox"
                        disabled={
                          alreadyVoted ||
                          (sectionVotes.length >= 3 && !sectionVotes.includes(index + 1))
                        }
                        checked={sectionVotes.includes(index + 1)}
                        onChange={() =>
                          handleVoteClick(q.id, q.dimension, section, index)
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
        disabled={
          !questionnaires?.length ||
          questionnaires.some((q) => !hasSelectedThreePerSection(q.id))
        }
      >
        Confirmar Todos os Votos
      </button>
    </div>
  );
};
