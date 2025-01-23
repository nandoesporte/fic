import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { EmailVerification } from "@/components/EmailVerification";
import { QuestionnaireList } from "@/components/QuestionnaireList";
import { useQuestionnaireVoting } from "@/hooks/useQuestionnaireVoting";

type ConsolidatedQuestionnaire = {
  id: string;
  dimension: string;
  strengths: string;
  challenges: string;
  opportunities: string;
  created_at: string;
  questionnaire_ids: string[];
};

export const QuestionnaireVoting = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const { session } = useAuth();
  const { 
    handleVote, 
    handleConfirmVotes, 
    isOptionSelected, 
    getSelectionCount 
  } = useQuestionnaireVoting(session);

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      if (!isEmailVerified) {
        return [];
      }

      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select(`
          *,
          questionnaire_vote_counts (
            option_type,
            option_number,
            upvotes,
            downvotes
          )
        `)
        .order('created_at', { ascending: false });

      if (questionnairesError) {
        console.error('Erro ao carregar questionários:', questionnairesError);
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      const consolidatedQuestionnaires = questionnairesData.reduce((acc: { [key: string]: ConsolidatedQuestionnaire }, curr) => {
        if (!acc[curr.dimension]) {
          acc[curr.dimension] = {
            id: curr.dimension,
            dimension: curr.dimension,
            strengths: curr.strengths,
            challenges: curr.challenges,
            opportunities: curr.opportunities,
            created_at: curr.created_at,
            questionnaire_ids: [curr.id],
          };
        } else {
          acc[curr.dimension].strengths += '\n\n' + curr.strengths;
          acc[curr.dimension].challenges += '\n\n' + curr.challenges;
          acc[curr.dimension].opportunities += '\n\n' + curr.opportunities;
          acc[curr.dimension].questionnaire_ids.push(curr.id);
        }
        return acc;
      }, {});

      return Object.values(consolidatedQuestionnaires);
    },
    enabled: isEmailVerified,
  });

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
            <p className="mt-2 text-gray-500">Você precisa estar autenticado para acessar o sistema de votação</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <EmailVerification
        session={session}
        onVerified={(email) => {
          setIsEmailVerified(true);
          setVerifiedEmail(email);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="text-gray-500">Votando com o email: {verifiedEmail}</p>
          <p className="text-sm text-gray-500 mt-2">Selecione exatamente 3 opções em cada seção</p>
        </div>

        <QuestionnaireList
          questionnaires={questionnaires || []}
          isLoading={isLoading}
          onVote={handleVote}
          isOptionSelected={isOptionSelected}
          getSelectionCount={getSelectionCount}
          onConfirmVotes={handleConfirmVotes}
        />
      </div>
    </div>
  );
};

export default QuestionnaireVoting;