import React, { useState } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { DimensionFilter } from './DimensionFilter';
import { VotingMetrics } from './VotingMetrics';
import { VotingResults } from './VotingResults';
import { AnalyticsHeader } from './AnalyticsHeader';
import { Loader2 } from 'lucide-react';

export const AnalyticsContainer = () => {
  const [selectedDimension, setSelectedDimension] = useState("all");
  const { dimensions, registeredVoters, votingData, isLoading } = useAnalyticsData(selectedDimension);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalVoters = registeredVoters?.length || 0;
  
  const calculateTotalVotes = (data: typeof votingData): number => {
    if (!data) return 0;
    
    return Object.values(data).reduce((acc: number, categoryVotes) => {
      if (!Array.isArray(categoryVotes)) return acc;
      return acc + categoryVotes.reduce((sum: number, vote) => sum + (vote.total || 0), 0);
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