import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PlusCircle, Users, BarChart2, TrendingUp, ClipboardList, Award, Heart, Sparkles, Trash2 } from "lucide-react";
import { FICForm } from "@/components/FICForm";
import { QuestionnaireResponses } from "@/components/QuestionnaireResponses";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DimensionManager } from "@/components/FICForm/DimensionManager";

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

const RegisteredVotersSection = () => {
  const [newVoterEmail, setNewVoterEmail] = useState("");
  const [newVoterName, setNewVoterName] = useState("");
  const queryClient = useQueryClient();

  const { data: voters, isLoading } = useQuery({
    queryKey: ['registered-voters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registered_voters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar cooperados');
        throw error;
      }

      return data;
    },
  });

  const addVoterMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name: string }) => {
      const { error } = await supabase
        .from('registered_voters')
        .insert([{ email, name }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registered-voters'] });
      setNewVoterEmail("");
      setNewVoterName("");
      toast.success('Cooperado adicionado com sucesso!');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao adicionar cooperado');
      }
    },
  });

  const deleteVoterMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('registered_voters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registered-voters'] });
      toast.success('Cooperado removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover cooperado');
    },
  });

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterEmail || !newVoterName) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    addVoterMutation.mutate({ email: newVoterEmail, name: newVoterName });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Adicionar Novo Cooperado</h3>
        <form onSubmit={handleAddVoter} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Nome do Cooperado"
              value={newVoterName}
              onChange={(e) => setNewVoterName(e.target.value)}
              className="mb-2"
            />
            <Input
              type="email"
              placeholder="Email do Cooperado"
              value={newVoterEmail}
              onChange={(e) => setNewVoterEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Cooperado
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lista de Cooperados</h3>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : voters?.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum cooperado cadastrado</p>
          ) : (
            voters?.map((voter) => (
              <div key={voter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{voter.name}</p>
                  <p className="text-sm text-gray-500">{voter.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja remover este cooperado?')) {
                      deleteVoterMutation.mutate(voter.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

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
              <TabsTrigger value="cooperados" className="data-[state=active]:bg-primary/10">
                Cooperados
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
                <div className="space-y-6">
                  <DimensionManager />
                  <FICForm />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="cooperados">
              <RegisteredVotersSection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
