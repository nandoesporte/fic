import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Users, BarChart2, TrendingUp, ClipboardList, Award, Heart, Sparkles } from "lucide-react";
import { FICForm } from "@/components/FICForm";
import { QuestionnaireResponses } from "@/components/QuestionnaireResponses";
import { useState } from "react";

const StatCard = ({ icon: Icon, label, value, description }: { icon: any; label: string; value: string; description?: string }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  </Card>
);

const AchievementCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      <div className="rounded-full bg-accent/10 p-3">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  </Card>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState("questionarios");

  const handleNewQuestionnaire = () => {
    setActiveTab("novo");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-gray-50 to-white">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                Dashboard FIC
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </h1>
              <p className="text-gray-500 mt-2">
                Bem-vindo ao Sistema de Felicidade Interna do Cooperativismo
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" 
              onClick={handleNewQuestionnaire}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Novo Questionário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="questionarios" className="data-[state=active]:bg-primary/10">
                Questionários
              </TabsTrigger>
              <TabsTrigger value="conquistas" className="data-[state=active]:bg-primary/10">
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="novo" className="data-[state=active]:bg-primary/10">
                Novo Questionário
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questionarios">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Respostas dos Questionários
                </h2>
                <QuestionnaireResponses />
              </Card>
            </TabsContent>

            <TabsContent value="conquistas" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="novo" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Novo Questionário FIC
                </h2>
                <FICForm />
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;