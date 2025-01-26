import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DimensionFilter } from "@/components/analytics/DimensionFilter";
import { VotingMetrics } from "@/components/analytics/VotingMetrics";
import { VotingResults } from "@/components/analytics/VotingResults";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useQuestionnaireVotes } from "@/hooks/useQuestionnaireVotes";

const QuestionnaireAnalytics = () => {
  const [selectedDimension, setSelectedDimension] = useState("all");

  const { data: dimensions } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) {
        toast.error('Erro ao carregar dimensões');
        throw error;
      }
      return data;
    },
  });

  // Get total registered voters
  const { data: registeredVoters } = useQuery({
    queryKey: ['registered-voters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registered_voters')
        .select('*');

      if (error) {
        toast.error('Erro ao carregar votantes registrados');
        throw error;
      }
      return data;
    },
  });

  const { data: votingData, isLoading } = useQuestionnaireVotes(selectedDimension);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalVoters = registeredVoters?.length || 0;
  const totalVotes = Object.values(votingData || {}).reduce((acc: number, categoryVotes: any[]) => {
    return acc + categoryVotes.reduce((sum, vote) => sum + vote.total, 0);
  }, 0);
  
  const expectedVotesPerUser = 9; // Each user should make 9 votes
  const expectedTotalVotes = totalVoters * expectedVotesPerUser;
  const participationRate = expectedTotalVotes > 0 
    ? Math.round((totalVotes / expectedTotalVotes) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold mb-6">Análise de Votos</h1>
      
      <div className="flex flex-col gap-6">
        <DimensionFilter
          selectedDimension={selectedDimension}
          onDimensionChange={setSelectedDimension}
          dimensions={dimensions}
        />
        
        <VotingMetrics
          totalVoters={totalVoters}
          totalVotes={totalVotes}
          participationRate={participationRate}
        />
      </div>

      <VotingResults
        strengths={votingData?.strengths || []}
        challenges={votingData?.challenges || []}
        opportunities={votingData?.opportunities || []}
      />
    </div>
  );
};

export default QuestionnaireAnalytics;