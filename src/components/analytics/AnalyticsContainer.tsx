import React, { useState } from 'react';
import { useQuestionnaireVotes } from '@/hooks/useQuestionnaireVotes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DimensionFilter } from './DimensionFilter';
import { VotingMetrics } from './VotingMetrics';
import { VotingResults } from './VotingResults';
import { AnalyticsHeader } from './AnalyticsHeader';
import { Loader2 } from 'lucide-react';

interface RegisteredVoter {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface Dimension {
  id: string;
  label: string;
  identifier: string;
  created_at: string;
  updated_at: string;
  background_color: string;
}

interface VoteOption {
  optionNumber: string;
  total: number;
  text: string;
}

interface VotingData {
  strengths: VoteOption[];
  challenges: VoteOption[];
  opportunities: VoteOption[];
}

export const AnalyticsContainer = () => {
  const [selectedDimension, setSelectedDimension] = useState("all");

  const { data: dimensions } = useQuery<Dimension[]>({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) {
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
  
  const calculateTotalVotes = (data: VotingData | undefined): number => {
    if (!data) return 0;
    
    return Object.values(data).reduce((acc: number, categoryVotes: VoteOption[]) => {
      if (!Array.isArray(categoryVotes)) return acc;
      return acc + categoryVotes.reduce((sum: number, vote: VoteOption) => sum + (vote.total || 0), 0);
    }, 0);
  };

  const totalVotes = calculateTotalVotes(votingData);
  const expectedVotesPerUser = 9;
  const expectedTotalVotes = totalVoters * expectedVotesPerUser;
  const participationRate = expectedTotalVotes > 0 
    ? Math.round((totalVotes / expectedTotalVotes) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      
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