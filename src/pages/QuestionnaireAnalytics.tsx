import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Vote } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";
import { DimensionFilter } from "@/components/analytics/DimensionFilter";
import { VoteList } from "@/components/analytics/VoteList";
import { toast } from "sonner";

type VoteData = {
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  total_votes: number;
  dimension?: string;
  satisfaction?: number;
  option_text?: string;
  strengths?: string;
  challenges?: string;
  opportunities?: string;
};

const QuestionnaireAnalytics = () => {
  const [selectedDimension, setSelectedDimension] = React.useState<string>("all");

  const { data: voteData, isLoading } = useQuery({
    queryKey: ["questionnaire-voting-report", selectedDimension],
    queryFn: async () => {
      let query = supabase
        .from("questionnaire_voting_report")
        .select(`*`)
        .gt('total_votes', 0);

      if (selectedDimension && selectedDimension !== "all") {
        query = query.eq('dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        toast.error("Erro ao carregar os votos");
        throw error;
      }

      const processedVotes = votes?.map((vote) => {
        let optionText = "";
        if (vote.option_type === "strengths" && vote.strengths) {
          const options = vote.strengths.split('\n\n');
          optionText = options[vote.option_number - 1] || "";
        } else if (vote.option_type === "challenges" && vote.challenges) {
          const options = vote.challenges.split('\n\n');
          optionText = options[vote.option_number - 1] || "";
        } else if (vote.option_type === "opportunities" && vote.opportunities) {
          const options = vote.opportunities.split('\n\n');
          optionText = options[vote.option_number - 1] || "";
        }
        
        return {
          ...vote,
          option_text: optionText,
        };
      }) || [];

      return processedVotes;
    },
  });

  const processDataForChart = (data: VoteData[] | undefined, type: string) => {
    if (!data) return [];
    
    return data
      .filter(item => item.option_type === type)
      .map(item => ({
        text: item.option_text || "",
        total: item.total_votes || 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getTotalVotes = (data: VoteData[] | undefined) => {
    if (!data) return 0;
    return data.reduce((acc, curr) => acc + (curr.total_votes || 0), 0);
  };

  const getTotalParticipants = (data: VoteData[] | undefined) => {
    if (!data) return 0;
    const uniqueGroups = new Set(
      data.map(vote => vote.dimension)
        .filter(dimension => {
          return dimension === selectedDimension || selectedDimension === "all";
        })
    );
    return uniqueGroups.size;
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análise de Votos</h1>
        <p className="text-gray-500">Visualização detalhada dos votos por questionário</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Total de Participantes"
              value={getTotalParticipants(voteData)}
              iconClassName="bg-blue-100"
            />
            <StatCard
              icon={Vote}
              title="Total de Votos"
              value={getTotalVotes(voteData)}
              iconClassName="bg-green-100"
            />
            <DimensionFilter
              selectedDimension={selectedDimension}
              onDimensionChange={setSelectedDimension}
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

            <TabsContent value="strengths">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Análise dos Pontos Fortes</h2>
                <VoteList type="strengths" data={processDataForChart(voteData, "strengths")} />
              </Card>
            </TabsContent>

            <TabsContent value="challenges">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Análise dos Desafios</h2>
                <VoteList type="challenges" data={processDataForChart(voteData, "challenges")} />
              </Card>
            </TabsContent>

            <TabsContent value="opportunities">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Análise das Oportunidades</h2>
                <VoteList type="opportunities" data={processDataForChart(voteData, "opportunities")} />
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default QuestionnaireAnalytics;