import { useState } from "react";
import { EmailVerification } from "@/components/questionnaire/EmailVerification";
import { QuestionnaireList } from "@/components/questionnaire/QuestionnaireList";
import { useVoteSelectionManager } from "@/components/questionnaire/VoteSelectionManager";
import { useQuestionnaireData } from "@/hooks/useQuestionnaireData";
import { QuestionnaireCard } from "@/components/QuestionnaireCard";

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { data: questionnaires } = useQuestionnaireData();
  const { 
    handleVote,
    isOptionSelected,
    getSelectionCount,
    validateSelections
  } = useVoteSelectionManager();

  if (!isEmailVerified) {
    return (
      <EmailVerification
        email={userEmail}
        onEmailChange={setUserEmail}
        onVerified={() => setIsEmailVerified(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="text-gray-500">Votando com o email: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        <div className="space-y-6">
          {questionnaires?.map((questionnaire) => (
            <QuestionnaireCard
              key={questionnaire.id}
              questionnaire={questionnaire}
              onVote={(optionType, optionNumber) => 
                handleVote(questionnaire.id, optionType, optionNumber)
              }
              isOptionSelected={(optionType, optionNumber) =>
                isOptionSelected(questionnaire.id, optionType, optionNumber)
              }
              getSelectionCount={(optionType) =>
                getSelectionCount(questionnaire.id, optionType)
              }
              onConfirmVotes={() => {
                if (validateSelections(questionnaire.id)) {
                  // Handle vote confirmation
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireVoting;