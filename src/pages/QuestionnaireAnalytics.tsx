import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DimensionFilter } from "@/components/analytics/DimensionFilter";
import { VotingMetrics } from "@/components/analytics/VotingMetrics";
import { VotingResults } from "@/components/analytics/VotingResults";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useQuestionnaireVotes } from "@/hooks/useQuestionnaireVotes";

interface RegisteredVoter {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface VotingData {
  strengths: Array<{ optionNumber: string; total: number; text: string }>;
  challenges: Array<{ optionNumber: string; total: number; text: string }>;
  opportunities: Array<{ optionNumber: string; total: number; text: string }>;
}

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

  const { data: registeredVoters } = useQuery<RegisteredVoter[]>({
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
  
  const calculateTotalVotes = (data: VotingData | null | undefined): number => {
    if (!data) return 0;
    
    return Object.values(data).reduce((acc: number, categoryVotes) => {
      if (!Array.isArray(categoryVotes)) return acc;
      return acc + categoryVotes.reduce((sum, vote) => sum + (Number(vote.total) || 0), 0);
    }, 0);
  };

  const totalVotes = calculateTotalVotes(votingData as VotingData);
  
  const expectedVotesPerUser = 9;
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