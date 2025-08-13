import { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";
import { useVoteSubmission } from "@/hooks/useVoteSubmission";
import { toast } from "sonner";

type SectionType = "strengths" | "challenges" | "opportunities";

interface VotingSectionProps {
  userEmail: string;
  questionnaires: any[];
  isLoading: boolean;
  selections: any;
  onVote: (questionnaireId: string, section: SectionType, optionNumber: number) => void;
  hasVotedInDimension: (dimension: string) => boolean;
}

const VotingSection: React.FC<VotingSectionProps> = ({
  questionnaires,
  isLoading,
  selections,
  onVote,
  hasVotedInDimension
}) => {
  if (isLoading) return <p>Carregando...</p>;

  return (
    <div>
      {questionnaires.map((questionnaire) => {
        const alreadyVoted = hasVotedInDimension(questionnaire.dimension);
        const questionnaireSelections = selections[questionnaire.id] || {
          strengths: [],
          challenges: [],
          opportunities: []
        };

        const isSectionFull = (section: string) =>
          questionnaireSelections[section]?.length >= 3;

        // Parse the string data into arrays
        const strengthsArray = questionnaire.strengths ? questionnaire.strengths.split('\n\n').filter(Boolean) : [];
        const challengesArray = questionnaire.challenges ? questionnaire.challenges.split('\n\n').filter(Boolean) : [];
        const opportunitiesArray = questionnaire.opportunities ? questionnaire.opportunities.split('\n\n').filter(Boolean) : [];

        return (
          <div
            key={questionnaire.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "8px"
            }}
          >
            <h3>Grupo: {questionnaire.group}</h3>
            <p><b>Dimensão:</b> {questionnaire.dimension}</p>

            {/* Pontos Fortes */}
            <h4>Pontos Fortes (selecione até 3)</h4>
            {strengthsArray.map((option: string, index: number) => {
              const optionNumber = index + 1;
              const selected = questionnaireSelections.strengths.includes(optionNumber);
              const disableOption =
                (!selected && isSectionFull("strengths")) || alreadyVoted;

              return (
                <button
                  key={`${questionnaire.id}-strengths-${index}`}
                  onClick={() => onVote(questionnaire.id, "strengths", optionNumber)}
                  disabled={disableOption}
                  style={{
                    margin: "5px",
                    background: selected ? "#007bff" : "#f5f5f5",
                    color: selected ? "#fff" : "#000",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: disableOption ? "not-allowed" : "pointer",
                    opacity: disableOption ? 0.6 : 1
                  }}
                >
                  {selected ? "✅ " : ""}{option}
                </button>
              );
            })}

            {/* Desafios */}
            <h4>Desafios (selecione até 3)</h4>
            {challengesArray.map((option: string, index: number) => {
              const optionNumber = index + 1;
              const selected = questionnaireSelections.challenges.includes(optionNumber);
              const disableOption =
                (!selected && isSectionFull("challenges")) || alreadyVoted;

              return (
                <button
                  key={`${questionnaire.id}-challenges-${index}`}
                  onClick={() => onVote(questionnaire.id, "challenges", optionNumber)}
                  disabled={disableOption}
                  style={{
                    margin: "5px",
                    background: selected ? "#ffc107" : "#f5f5f5",
                    color: "#000",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: disableOption ? "not-allowed" : "pointer",
                    opacity: disableOption ? 0.6 : 1
                  }}
                >
                  {selected ? "✅ " : ""}{option}
                </button>
              );
            })}

            {/* Oportunidades */}
            <h4>Oportunidades (selecione até 3)</h4>
            {opportunitiesArray.map((option: string, index: number) => {
              const optionNumber = index + 1;
              const selected = questionnaireSelections.opportunities.includes(optionNumber);
              const disableOption =
                (!selected && isSectionFull("opportunities")) || alreadyVoted;

              return (
                <button
                  key={`${questionnaire.id}-opportunities-${index}`}
                  onClick={() => onVote(questionnaire.id, "opportunities", optionNumber)}
                  disabled={disableOption}
                  style={{
                    margin: "5px",
                    background: selected ? "#28a745" : "#f5f5f5",
                    color: selected ? "#fff" : "#000",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: disableOption ? "not-allowed" : "pointer",
                    opacity: disableOption ? 0.6 : 1
                  }}
                >
                  {selected ? "✅ " : ""}{option}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const {
    questionnaires,
    isLoading,
    selections,
    handleVote: baseHandleVote,
    setSelections,
    hasVotedInDimension
  } = useQuestionnaireVoting(isEmailVerified, userEmail);

  const submitVotesMutation = useVoteSubmission(userEmail);

  const handleVote = (questionnaireId: string, section: SectionType, optionNumber: number) => {
    const currentSelections = selections[questionnaireId]?.[section] || [];
    const alreadySelected = currentSelections.includes(optionNumber);

    if (!alreadySelected && currentSelections.length >= 3) {
      toast.error("Você só pode selecionar até 3 opções nesta seção.");
      return;
    }

    baseHandleVote(questionnaireId, section, optionNumber);
  };

  const handleConfirmAllVotes = async () => {
    if (!questionnaires || questionnaires.length === 0) return;

    const dimensions = [...new Set(questionnaires.map(q => q.dimension))];

    for (const dimension of dimensions) {
      if (hasVotedInDimension(dimension)) {
        toast.error(`Você já votou na dimensão: ${dimension}.`);
        return;
      }
    }

    for (const dimension of dimensions) {
      const dimensionQuestionnaires = questionnaires.filter(q => q.dimension === dimension);

      let totalStrengths = 0;
      let totalChallenges = 0;
      let totalOpportunities = 0;

      for (const questionnaire of dimensionQuestionnaires) {
        const questionnaireSelections = selections[questionnaire.id];
        if (!questionnaireSelections) {
          toast.error(`Selecione exatamente 3 opções em cada seção na dimensão: ${dimension}.`);
          return;
        }

        totalStrengths += questionnaireSelections.strengths?.length || 0;
        totalChallenges += questionnaireSelections.challenges?.length || 0;
        totalOpportunities += questionnaireSelections.opportunities?.length || 0;
      }

      if (totalStrengths !== 3 || totalChallenges !== 3 || totalOpportunities !== 3) {
        toast.error(`A dimensão "${dimension}" precisa ter exatamente 3 seleções em cada seção.`);
        return;
      }
    }

    for (const questionnaire of questionnaires) {
      const questionnaireSelections = selections[questionnaire.id];
      if (questionnaireSelections) {
        const votes = Object.entries(questionnaireSelections).map(([optionType, optionNumbers]) => ({
          optionType,
          optionNumbers,
        }));

        await submitVotesMutation.mutate({
          questionnaireId: questionnaire.id,
          votes,
          dimension: questionnaire.dimension
        });
      }
    }

    toast.success("Todos os votos foram enviados com sucesso!");
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
    <>
      <VotingSection
        userEmail={userEmail}
        questionnaires={questionnaires || []}
        isLoading={isLoading}
        selections={selections}
        onVote={handleVote}
        hasVotedInDimension={hasVotedInDimension}
      />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleConfirmAllVotes}
          disabled={submitVotesMutation.isPending}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Confirmar Todos os Votos
        </button>
      </div>
    </>
  );
};

export default QuestionnaireVoting;
