import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmailVerification } from "@/components/voting/EmailVerification";
import { QuestionnaireSelectionManager } from "@/components/voting/QuestionnaireSelectionManager";

export const QuestionnaireVoting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const queryClient = useQueryClient();

  const verifyEmail = async () => {
    try {
      const { data: existingVoter } = await supabase
        .from("registered_voters")
        .select("*")
        .eq("email", userEmail)
        .single();

      if (existingVoter) {
        setIsEmailVerified(true);
        return true;
      }

      const { error: insertError } = await supabase
        .from("registered_voters")
        .insert([{ email: userEmail }]);

      if (insertError) throw insertError;

      setIsEmailVerified(true);
      return true;
    } catch (error) {
      console.error("Error verifying email:", error);
      return false;
    }
  };

  const { data: questionnaires } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fic_questionnaires")
        .select("*")
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
  });

  const handleVoteSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Votação</h1>

      <EmailVerification
        userEmail={userEmail}
        isEmailVerified={isEmailVerified}
        onEmailChange={setUserEmail}
        onVerifyEmail={verifyEmail}
      />

      <div className="space-y-8 mt-6">
        {questionnaires?.map((questionnaire) => (
          <QuestionnaireSelectionManager
            key={questionnaire.id}
            questionnaire={questionnaire}
            userEmail={userEmail}
            onVoteSubmitted={handleVoteSubmitted}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionnaireVoting;