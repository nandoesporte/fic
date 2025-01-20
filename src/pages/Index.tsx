import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, BarChart2, TrendingUp } from "lucide-react";

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

const Index = () => {
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
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="h-5 w-5 mr-2" />
              Novo Questionário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total de Cooperados" value="1,234" />
            <StatCard icon={BarChart2} label="Índice de Felicidade" value="78%" />
            <StatCard icon={TrendingUp} label="Crescimento Mensal" value="+12%" />
            <StatCard icon={Users} label="Participação" value="89%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Questionários Recentes</h2>
              <div className="space-y-4">
                {["Dimensão Padrão de Vida", "Dimensão Uso do Tempo"].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span>{item}</span>
                    <Button variant="outline">Ver Detalhes</Button>
                  </div>
                ))}
              </div>
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;