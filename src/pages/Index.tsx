import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Users, BarChart2, TrendingUp, ClipboardList, Award, Heart, Loader2 } from "lucide-react";
import { FICForm } from "@/components/FICForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  </Card>
);

const QuestionnaireCard = ({ title, status, date, onClick }: { 
  title: string; 
  status: string; 
  date: string;
  onClick?: () => void;
}) => (
  <div 
    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <ClipboardList className="h-5 w-5 text-primary" />
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
    <span className={`px-3 py-1 rounded-full text-sm ${
      status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {status}
    </span>
  </div>
);

const AchievementCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <Card className="p-4">
    <div className="flex items-start gap-4">
      <div className="rounded-full bg-accent/10 p-2">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </Card>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState("questionarios");

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar questionários');
        throw error;
      }

      return data;
    },
  });

  const handleNewQuestionnaire = () => {
    setActiveTab("novo");
  };

  const handleQuestionnaireClick = (id: string) => {
    setActiveTab("novo");
    // You could also store the questionnaire ID in state if you need to pre-fill the form
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard FIC</h1>
              <p className="text-gray-500">Bem-vindo ao Sistema de Felicidade Interna do Cooperativismo</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleNewQuestionnaire}>
              <PlusCircle className="h-5 w-5 mr-2" />
              Novo Questionário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Heart} label="Índice FIC" value="78%" />
            <StatCard icon={Users} label="Total de Cooperados" value="1,234" />
            <StatCard icon={BarChart2} label="Taxa de Participação" value="89%" />
            <StatCard icon={TrendingUp} label="Crescimento Mensal" value="+12%" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="questionarios">Questionários</TabsTrigger>
              <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
              <TabsTrigger value="novo">Novo Questionário</TabsTrigger>
            </TabsList>

            <TabsContent value="questionarios" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Questionários Disponíveis</h2>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questionnaires?.map((questionnaire) => (
                        <QuestionnaireCard 
                          key={questionnaire.id}
                          title={`Dimensão ${questionnaire.dimension}`}
                          status={questionnaire.status === 'pending' ? 'Pendente' : 'Completo'}
                          date={`Criado em ${new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}`}
                          onClick={() => handleQuestionnaireClick(questionnaire.id)}
                        />
                      ))}
                      {questionnaires?.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Nenhum questionário disponível no momento.
                        </p>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
                  <div className="space-y-4">
                    {[
                      "Nova resposta ao questionário de Bem-estar",
                      "Meta mensal de participação atingida",
                      "Novo relatório disponível",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conquistas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AchievementCard 
                  icon={Award}
                  title="Participação 100%"
                  description="Todos os cooperados responderam o último questionário"
                />
                <AchievementCard 
                  icon={TrendingUp}
                  title="Crescimento Constante"
                  description="3 meses consecutivos de melhoria no índice FIC"
                />
                <AchievementCard 
                  icon={Heart}
                  title="Bem-estar em Alta"
                  description="Índice de satisfação acima de 80%"
                />
              </div>
            </TabsContent>

            <TabsContent value="novo" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Novo Questionário FIC</h2>
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
