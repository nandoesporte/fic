import { useState } from "react";
import { EmailVerification } from "@/components/questionnaire/EmailVerification";
import { QuestionnaireList } from "@/components/questionnaire/QuestionnaireList";
import { useVoteSelectionManager } from "@/components/questionnaire/VoteSelectionManager";
import { useQuestionnaireData } from "@/hooks/useQuestionnaireData";

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { data: questionnaires, isLoading } = useQuestionnaireData();
  const [editingLine, setEditingLine] = useState<{
    questionnaireId: string;
    type: 'strengths' | 'challenges' | 'opportunities';
    index: number;
    value: string;
  } | null>(null);

  if (!isEmailVerified) {
    return (
      <EmailVerification
        email={userEmail}
        onEmailChange={setUserEmail}
        onVerified={() => setIsEmailVerified(true)}
      />
    );
  }

  const handleLineEdit = (
    questionnaireId: string,
    type: 'strengths' | 'challenges' | 'opportunities',
    index: number,
    value: string
  ) => {
    setEditingLine({ questionnaireId, type, index, value });
  };

  const handleLineSave = (questionnaire: any) => {
    setEditingLine(null);
  };

  const handleToggleStatus = (
    questionnaireId: string,
    type: 'strengths' | 'challenges' | 'opportunities',
    index: number,
    currentStatus: string
  ) => {
    // Implementation for toggle status if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="text-gray-500">Votando com o email: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        {questionnaires && (
          <QuestionnaireList
            questionnaires={questionnaires}
            editingLine={editingLine}
            onLineEdit={handleLineEdit}
            onLineSave={handleLineSave}
            onToggleStatus={handleToggleStatus}
            setEditingLine={setEditingLine}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionnaireVoting;