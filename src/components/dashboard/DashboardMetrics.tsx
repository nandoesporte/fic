import { Card } from "@/components/ui/card";
import { Heart, Users, BarChart2, TrendingUp } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={Heart} 
        label="Índice FIC" 
        value="78%" 
        description="Crescimento de 5% este mês"
      />
      <StatCard 
        icon={Users} 
        label="Total de Cooperados" 
        value="1,234"
        description="32 novos esta semana" 
      />
      <StatCard 
        icon={BarChart2} 
        label="Taxa de Participação" 
        value="89%"
        description="Acima da meta mensal" 
      />
      <StatCard 
        icon={TrendingUp} 
        label="Crescimento Mensal" 
        value="+12%"
        description="Comparado ao mês anterior" 
      />
    </div>
  );
};