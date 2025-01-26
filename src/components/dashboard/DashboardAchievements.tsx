import { Card } from "@/components/ui/card";
import { Award, TrendingUp, Heart } from "lucide-react";
import { useFICMetrics } from "@/hooks/useFICMetrics";

const AchievementCard = ({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  icon: any 
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-5">
      <div className="rounded-full bg-accent/10 p-4">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h3 className="font-medium mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  </Card>
);

export const DashboardAchievements = () => {
  const { data: metrics } = useFICMetrics();

  const topDimensions = metrics?.dimensionMetrics
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) || [];

  const hasHighPerformer = topDimensions.some(d => d.score >= 80);
  const hasImprovement = metrics?.dailyMetrics[0]?.average_index > (metrics?.dailyMetrics[1]?.average_index || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hasHighPerformer && (
        <AchievementCard 
          icon={Award}
          title="Dimensão Destaque"
          description={`A dimensão ${topDimensions[0]?.dimension} alcançou ${topDimensions[0]?.score.toFixed(1)}% de satisfação.`}
        />
      )}
      {hasImprovement && (
        <AchievementCard 
          icon={TrendingUp}
          title="Crescimento Contínuo"
          description="Melhoria no índice FIC em relação ao período anterior."
        />
      )}
      <AchievementCard 
        icon={Heart}
        title="Engajamento"
        description={`${metrics?.dailyMetrics.length || 0} respostas registradas nos últimos 30 dias.`}
      />
    </div>
  );
};