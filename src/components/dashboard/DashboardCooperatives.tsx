import { Card } from "@/components/ui/card";
import { Building2, Users, TrendingUp } from "lucide-react";

const CooperativeCard = ({ 
  name, 
  members, 
  engagement 
}: { 
  name: string;
  members: number;
  engagement: number;
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-5">
      <div className="rounded-full bg-secondary/10 p-4">
        <Building2 className="h-5 w-5 text-secondary" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium mb-2">{name}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{members} membros</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{engagement}% engajamento</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export const DashboardCooperatives = () => {
  // This would ideally come from an API/database
  const cooperatives = [
    { name: "Cocamar", members: 15800, engagement: 88 },
    { name: "Sicoob", members: 25300, engagement: 92 },
    { name: "Frísia", members: 12400, engagement: 85 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cooperatives.map((coop, index) => (
        <CooperativeCard key={index} {...coop} />
      ))}
    </div>
  );
};