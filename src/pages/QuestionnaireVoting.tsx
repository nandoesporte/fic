import { useState } from "react";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";
import { useVoteSubmission } from "@/hooks/useVoteSubmission";
import { toast } from "sonner";

const QuestionnaireVoting = () => {
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

  // Controle para impedir ultrapassar 3 por seção
  const handleVote = (questionnaireId, section, option) => {
    const currentSelections = selections[questionnaireId]?.[section] || [];
    const alreadySelected = currentSelections.includes(option);

    if (!alreadySelected && currentSelections.length >= 3) {
      toast.error("Você só pode selecionar até 3 opções nesta seção.");
      return;
    }

    baseHandleVote(questionnaireId, section, option);
  };

  const handleConfirmAllVotes = async () => {
    if (!questionnaires || questionnaires.length === 0) return;

    const dimensions = [...new Set(questionnaires.map(q => q.dimension))];

    // Verifica se já votou em alguma dimensão
    for (const dimension of dimensions) {
      if (hasVotedInDimension(dimension)) {
        toast.error(`Você já votou na dimensão: ${dimension}.`);
        return;
      }
    }

    // Valida todas as dimensões
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

    // Se passou na validação, enviar todos de uma vez
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

      {/* Botão único no final */}
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

// COMPONENTE VotingSection INTEGRADO
const VotingSection = ({
  userEmail,
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

        const isSectionFull = (section) =>
          questionnaireSelections[section]?.length >= 3;

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
            <h3>{questionnaire.title}</h3>
            <p><b>Dimensão:</b> {questionnaire.dimension}</p>

            {/* Pontos Fortes */}
            <h4>Pontos Fortes (selecione até 3)</h4>
            {questionnaire.strengths.map((option) => {
              const selected = questionnaireSelections.strengths.includes(option);
              const disableOption =
                (!selected && isSectionFull("strengths")) || alreadyVoted;

              return (
                <button
                  key={option}
                  onClick={() => onVote(questionnaire.id, "strengths", option)}
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
            {questionnaire.challenges.map((option) => {
              const selected = questionnaireSelections.challenges.includes(option);
              const disableOption =
                (!selected && isSectionFull("challenges")) || alreadyVoted;

              return (
                <button
                  key={option}
                  onClick={() => onVote(questionnaire.id, "challenges", option)}
                  disabled={disableOption}
                  style={{
                    margin: "5px",
                    background: selected ? "#ffc107" : "#f5f5f5",
                    color: selected ? "#000" : "#000",
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
            {questionnaire.opportunities.map((option) => {
              const selected = questionnaireSelections.opportunities.includes(option);
              const disableOption =
                (!selected && isSectionFull("opportunities")) || alreadyVoted;

              return (
                <button
                  key={option}
                  onClick={() => onVote(questionnaire.id, "opportunities", option)}
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

export default QuestionnaireVoting;
