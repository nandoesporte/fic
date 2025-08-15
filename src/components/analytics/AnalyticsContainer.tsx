import React, { useState } from 'react';
import { useIndividualVotes } from '@/hooks/useIndividualVotes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DimensionFilter } from './DimensionFilter';
import { VotingMetrics } from './VotingMetrics';
import { IndividualVotesList } from './IndividualVotesList';
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

interface IndividualVote {
  id: string;
  email: string;
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  vote_type: string;
  created_at: string;
  dimension: string;
  option_text: string;
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

  // Also fetch dimension votes to get accurate participation data
  const { data: dimensionVotes } = useQuery({
    queryKey: ['dimension-votes', selectedDimension],
    queryFn: async () => {
      let query = supabase.from('dimension_votes').select('*');
      
      if (selectedDimension !== "all") {
        query = query.eq('dimension', selectedDimension);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      console.log("Dimension votes:", data);
      return data;
    },
  });

  const { data: votingData, isLoading } = useIndividualVotes(selectedDimension);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalVoters = registeredVoters?.length || 0;
  
  const totalVotes = votingData ? 
    votingData.strengths.length +
    votingData.challenges.length +
    votingData.opportunities.length : 0;
  
  // Contar participantes únicos por email
  const uniqueParticipants = dimensionVotes 
    ? new Set(dimensionVotes.map(vote => vote.email)).size 
    : 0;
  
  const participationRate = totalVoters > 0 
    ? Math.round((uniqueParticipants / totalVoters) * 100) 
    : 0;

  console.log("Analytics summary:", {
    totalVoters,
    uniqueParticipants,
    totalVotes,
    participationRate,
    selectedDimension
  });

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

      <div className="grid gap-6">
        <IndividualVotesList
          type="strengths"
          data={votingData?.strengths || []}
        />
        <IndividualVotesList
          type="challenges"
          data={votingData?.challenges || []}
        />
        <IndividualVotesList
          type="opportunities"
          data={votingData?.opportunities || []}
        />
      </div>
    </div>
  );
};