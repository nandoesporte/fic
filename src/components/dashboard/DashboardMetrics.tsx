import { Card } from "@/components/ui/card";
import { Heart, Users, BarChart2, TrendingUp } from "lucide-react";
import { useFICMetrics } from "@/hooks/useFICMetrics";

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  description 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  description?: string 
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-5">
      <div className="rounded-full bg-primary/10 p-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
      </div>
    </div>
  </Card>
);

export const DashboardMetrics = () => {
  const { data: metrics, isLoading } = useFICMetrics();

  const currentFICIndex = metrics?.dailyMetrics[0]?.average_index || 0;
  const previousFICIndex = metrics?.dailyMetrics[1]?.average_index || 0;
  const indexChange = currentFICIndex - previousFICIndex;
  const indexTrend = indexChange >= 0 ? "+" : "";

  const topDimension = metrics?.dimensionMetrics[0]?.dimension || "N/A";
  const topDimensionScore = metrics?.dimensionMetrics[0]?.score || 0;

  const totalResponses = metrics?.dailyMetrics.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={Heart} 
        label="Índice FIC" 
        value={`${currentFICIndex.toFixed(1)}%`} 
        description={`${indexTrend}${indexChange.toFixed(1)}% em relação ao dia anterior`}
      />
      <StatCard 
        icon={Users} 
        label="Dimensão Destaque" 
        value={topDimension}
        description={`Score: ${topDimensionScore.toFixed(1)}%`} 
      />
      <StatCard 
        icon={BarChart2} 
        label="Total de Respostas" 
        value={totalResponses.toString()}
        description="Nos últimos 30 dias" 
      />
      <StatCard 
        icon={TrendingUp} 
        label="Tendência Mensal" 
        value={`${indexTrend}${indexChange.toFixed(1)}%`}
        description="Comparado ao mês anterior" 
      />
    </div>
  );
};