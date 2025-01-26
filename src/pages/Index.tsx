import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { DimensionManager } from "@/components/FICForm/DimensionManager";
import { FICForm } from "@/components/FICForm";
import { ClipboardList } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("novo");

  const handleNewQuestionnaire = () => {
    setActiveTab("novo");
  };

  return (
    <div className="space-y-8">
      <DashboardHeader onNewQuestionnaire={handleNewQuestionnaire} />
      
      <DashboardMetrics />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white shadow-sm p-1.5 rounded-lg">
          <TabsTrigger value="conquistas" className="data-[state=active]:bg-primary/10 px-6">
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="novo" className="data-[state=active]:bg-primary/10 px-6">
            Novo Questionário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conquistas">
          <DashboardAchievements />
        </TabsContent>

        <TabsContent value="novo" className="space-y-6">
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              Novo Questionário FIC
            </h2>
            <div className="space-y-8">
              <DimensionManager />
              <FICForm />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;