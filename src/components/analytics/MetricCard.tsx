import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  iconClassName?: string;
  description?: string;
}

export const MetricCard = ({ icon: Icon, title, value, iconClassName, description }: MetricCardProps) => {
  return (
    <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconClassName}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};