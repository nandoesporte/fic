import { MetricCard } from "./MetricCard";
import { Users, Vote, ChartBar, Brain } from "lucide-react";

interface AIVotingMetricsProps {
  totalVoters: number;
  totalVotes: number;
  uniqueVoters: number;
  participationRate: number;
}

export const AIVotingMetrics = ({ 
  totalVoters, 
  totalVotes, 
  uniqueVoters, 
  participationRate 
}: AIVotingMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard
        icon={Users}
        title="Eleitores Registrados"
        value={totalVoters}
        description="Total de eleitores no sistema"
        iconClassName="bg-blue-100 text-blue-600"
      />
      <MetricCard
        icon={Vote}
        title="Participantes Únicos"
        value={uniqueVoters}
        description="Pessoas que efetivamente votaram"
        iconClassName="bg-green-100 text-green-600"
      />
      <MetricCard
        icon={ChartBar}
        title="Total de Votos"
        value={totalVotes}
        description="Soma de todos os votos realizados"
        iconClassName="bg-purple-100 text-purple-600"
      />
      <MetricCard
        icon={Brain}
        title="Taxa de Participação"
        value={`${participationRate}%`}
        description="Baseado em participantes únicos"
        iconClassName="bg-orange-100 text-orange-600"
      />
    </div>
  );
};