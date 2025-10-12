
import { MetricCard } from "./MetricCard";
import { Users, Vote, ChartBar } from "lucide-react";

interface VotingMetricsProps {
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
}

export const VotingMetrics = ({ totalVoters, totalVotes, participationRate }: VotingMetricsProps) => {
  // Calculate actual participants based on unique voters who have submitted votes
  // Each participant should vote in all 3 categories (strengths, challenges, opportunities)
  // with up to 3 votes per category, so max 9 votes per participant
  const estimatedParticipants = totalVotes > 0 ? Math.ceil(totalVotes / 9) : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard
        icon={Users}
        title="Participantes Estimados"
        value={estimatedParticipants}
        description=""
        iconClassName="bg-blue-100 text-blue-600"
      />
      <MetricCard
        icon={Vote}
        title="Total de Votos"
        value={totalVotes}
        description="Soma de todos os votos realizados"
        iconClassName="bg-green-100 text-green-600"
      />
    </div>
  );
};
