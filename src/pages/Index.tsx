import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCooperatives } from "@/components/dashboard/DashboardCooperatives";

const Index = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <DashboardCooperatives />
    </div>
  );
};

export default Index;