import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  iconClassName?: string;
}

export function StatCard({ icon: Icon, title, value, iconClassName }: StatCardProps) {
  return (
    <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconClassName}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </Card>
  );
}