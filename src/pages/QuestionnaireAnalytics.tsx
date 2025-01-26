import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DimensionFilter } from "@/components/analytics/DimensionFilter";
import { VotingMetrics } from "@/components/analytics/VotingMetrics";
import { VotingResults } from "@/components/analytics/VotingResults";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const QuestionnaireAnalytics = () => {
  const [selectedDimension, setSelectedDimension] = useState("all");

  const { data: dimensions } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) throw error;
      return data;
    },
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedDimension],
    queryFn: async () => {
      console.log('Fetching analytics data for dimension:', selectedDimension);
      
      let query = supabase
        .from('questionnaire_voting_report')
        .select('*')
        .order('total_votes', { ascending: false });

      if (selectedDimension !== 'all') {
        query = query.eq('dimension', selectedDimension);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar dados');
        throw error;
      }

      console.log('Analytics data fetched:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const processVotingData = (type: string) => {
    return analytics
      ?.filter(item => item.option_type === type)
      .map(item => ({
        optionNumber: String(item.option_number),
        total: item.total_votes || 0,
        text: item[type] || '',
      })) || [];
  };

  const totalVotes = analytics?.reduce((acc, curr) => acc + (curr.total_votes || 0), 0) || 0;
  const totalVoters = Math.floor(totalVotes / 9); // Each participant must make 9 votes
  const participationRate = totalVoters > 0 ? Math.round((totalVotes / (totalVoters * 9)) * 100) : 0;

  return (
    <div className="space-y-6">
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
        strengths={processVotingData('strengths')}
        challenges={processVotingData('challenges')}
        opportunities={processVotingData('opportunities')}
      />
    </div>
  );
};

export default QuestionnaireAnalytics;