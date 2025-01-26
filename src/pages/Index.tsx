import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { RegisteredVotersSection } from "@/components/RegisteredVotersSection";
import { DimensionManager } from "@/components/FICForm/DimensionManager";
import { FICForm } from "@/components/FICForm";
import { QuestionnaireResponses } from "@/components/QuestionnaireResponses";
import { ClipboardList } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("questionarios");

  const handleNewQuestionnaire = () => {
    setActiveTab("novo");
  };

  return (
    <div className="space-y-8">
      <DashboardHeader onNewQuestionnaire={handleNewQuestionnaire} />
      
      <DashboardMetrics />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white shadow-sm p-1.5 rounded-lg">
          <TabsTrigger value="questionarios" className="data-[state=active]:bg-primary/10 px-6">
            Questionários
          </TabsTrigger>
          <TabsTrigger value="conquistas" className="data-[state=active]:bg-primary/10 px-6">
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="novo" className="data-[state=active]:bg-primary/10 px-6">
            Novo Questionário
          </TabsTrigger>
          <TabsTrigger value="cooperados" className="data-[state=active]:bg-primary/10 px-6">
            Cooperados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questionarios">
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              Respostas dos Questionários
            </h2>
            <QuestionnaireResponses />
          </Card>
        </TabsContent>

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

        <TabsContent value="cooperados">
          <RegisteredVotersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;