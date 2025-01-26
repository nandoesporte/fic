import { useState } from "react";
import { useVotingLogic } from "@/hooks/useVotingLogic";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { QuestionnaireList } from "@/components/voting/QuestionnaireList";

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { questionnaires, isLoading, selections, handleVote, handleConfirmVotes } = useVotingLogic();

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

        <QuestionnaireList
          questionnaires={questionnaires || []}
          isLoading={isLoading}
          selections={selections}
          onVote={handleVote}
          onConfirmVotes={handleConfirmVotes}
        />
      </div>
    </div>
  );
};

export default QuestionnaireVoting;