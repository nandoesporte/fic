import { Card } from "@/components/ui/card";
import { Award, TrendingUp, Heart } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AchievementCard 
        icon={Award}
        title="Participação 100%"
        description="Todos os cooperados responderam o último questionário do mês, demonstrando alto engajamento."
      />
      <AchievementCard 
        icon={TrendingUp}
        title="Crescimento Constante"
        description="3 meses consecutivos de melhoria no índice FIC, refletindo o comprometimento da equipe."
      />
      <AchievementCard 
        icon={Heart}
        title="Bem-estar em Alta"
        description="Índice de satisfação acima de 80%, indicando um ambiente de trabalho positivo."
      />
    </div>
  );
};