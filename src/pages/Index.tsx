import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";

const Index = () => {
  const [activeTab, setActiveTab] = useState("conquistas");

  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      <DashboardMetrics />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white shadow-sm p-1.5 rounded-lg">
          <TabsTrigger value="conquistas" className="data-[state=active]:bg-primary/10 px-6">
            Conquistas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conquistas">
          <DashboardAchievements />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;