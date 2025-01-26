import { MetricCard } from "./MetricCard";
import { Users, Vote, Target } from "lucide-react";

interface VotingMetricsProps {
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
}

export const VotingMetrics = ({ totalVoters, totalVotes, participationRate }: VotingMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        icon={Users}
        title="Total de Participantes"
        value={totalVoters}
        description="Cada participante deve fazer 9 votos"
        iconClassName="bg-blue-100 text-blue-600"
      />
      <MetricCard
        icon={Vote}
        title="Total de Votos"
        value={totalVotes}
        description="Soma de todos os votos realizados"
        iconClassName="bg-green-100 text-green-600"
      />
      <MetricCard
        icon={Target}
        title="Taxa de Participação"
        value={`${participationRate}%`}
        description="Baseado no total de votos esperados"
        iconClassName="bg-purple-100 text-purple-600"
      />
    </div>
  );
};