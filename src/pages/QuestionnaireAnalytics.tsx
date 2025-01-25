import { useState } from "react";
import { Loader2, Users, Vote, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DimensionFilter } from "@/components/analytics/DimensionFilter";
import { VoteList } from "@/components/analytics/VoteList";
import { useQuestionnaireVotes } from "@/hooks/useQuestionnaireVotes";

const QuestionnaireAnalytics = () => {
  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dimensions } = useQuery({
    queryKey: ["dimensions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fic_dimensions")
        .select("*")
        .order("label");

      if (error) throw error;
      return data;
    },
  });

  const { data: voteData, isLoading } = useQuestionnaireVotes(selectedDimension);

  const handleClearVotes = async () => {
    try {
      setIsClearing(true);
      const { error: cleanError } = await supabase.rpc('clean_questionnaire_votes');
      
      if (cleanError) throw cleanError;

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['questionnaire-votes'] });
      queryClient.invalidateQueries({ queryKey: ['registered-voters'] });

      toast({
        title: "Sucesso",
        description: "Todos os votos foram limpos com sucesso!",
      });
    } catch (error) {
      console.error('Error clearing votes:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao limpar os votos.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const processDataForChart = (type: string) => {
    if (!voteData) return [];
    
    return voteData
      .filter(item => item.option_type === type)
      .map(item => ({
        optionNumber: `Opção ${item.option_number}`,
        total: (item.upvotes || 0),
        text: item.option_text || "",
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getTotalVotes = () => {
    if (!voteData) return 0;
    return voteData.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);
  };

  const getTotalParticipants = () => {
    if (!voteData) return 0;
    const totalVotes = getTotalVotes();
    return Math.ceil(totalVotes / 9);
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análise de Votos</h1>
            <p className="text-gray-500">Visualização detalhada dos votos por questionário</p>
          </div>
          <Button
            variant="destructive"
            onClick={handleClearVotes}
            disabled={isClearing}
            className="gap-2"
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Limpar Votos
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              icon={Users}
              title="Total de Participantes"
              value={getTotalParticipants()}
              iconClassName="bg-blue-100"
            />
            <MetricCard
              icon={Vote}
              title="Total de Votos"
              value={getTotalVotes()}
              iconClassName="bg-green-100"
            />
            <DimensionFilter
              selectedDimension={selectedDimension}
              onDimensionChange={setSelectedDimension}
              dimensions={dimensions}
            />
          </div>

          <Tabs defaultValue="strengths" className="space-y-6">
            <TabsList className="bg-white p-1.5 rounded-lg">
              <TabsTrigger value="strengths" className="data-[state=active]:bg-[#2F855A] data-[state=active]:text-white px-6">
                Pontos Fortes
              </TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-gray-900 px-6">
                Desafios
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="data-[state=active]:bg-[#000080] data-[state=active]:text-white px-6">
                Oportunidades
              </TabsTrigger>
            </TabsList>

            {["strengths", "challenges", "opportunities"].map((type) => (
              <TabsContent key={type} value={type}>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">
                    {type === "strengths" && "Análise dos Pontos Fortes"}
                    {type === "challenges" && "Análise dos Desafios"}
                    {type === "opportunities" && "Análise das Oportunidades"}
                  </h2>
                  <VoteList 
                    type={type as "strengths" | "challenges" | "opportunities"}
                    data={processDataForChart(type)}
                  />
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default QuestionnaireAnalytics;