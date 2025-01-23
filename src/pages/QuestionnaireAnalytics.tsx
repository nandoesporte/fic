import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Users, Vote } from "lucide-react";

type VoteData = {
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  upvotes: number;
  downvotes: number;
  dimension?: string;
  satisfaction?: number;
  option_text?: string;
};

const QuestionnaireAnalytics = () => {
  const { data: voteData, isLoading } = useQuery({
    queryKey: ["questionnaire-votes"],
    queryFn: async () => {
      const { data: votes, error } = await supabase
        .from("questionnaire_vote_counts")
        .select(`
          questionnaire_id,
          option_type,
          option_number,
          upvotes,
          downvotes,
          fic_questionnaires (
            dimension,
            satisfaction,
            strengths,
            challenges,
            opportunities
          )
        `);

      if (error) throw error;

      const processedVotes = votes.map((vote) => {
        let optionText = "";
        if (vote.fic_questionnaires) {
          const options = vote.option_type === "strengths" 
            ? vote.fic_questionnaires.strengths
            : vote.option_type === "challenges"
              ? vote.fic_questionnaires.challenges
              : vote.fic_questionnaires.opportunities;
          
          const optionsList = options?.split('\n\n').filter(Boolean) || [];
          optionText = optionsList[vote.option_number - 1] || "";
        }
        return {
          ...vote,
          option_text: optionText,
        };
      });

      return processedVotes as VoteData[];
    },
  });

  const processDataForChart = (data: VoteData[] | undefined, type: string) => {
    if (!data) return [];
    
    return data
      .filter(item => item.option_type === type)
      .map(item => ({
        optionNumber: `Opção ${item.option_number}`,
        upvotes: item.upvotes || 0,
        downvotes: item.downvotes || 0,
        total: (item.upvotes || 0) - (item.downvotes || 0),
        text: item.option_text || "",
      }));
  };

  const getTotalVotes = (data: VoteData[] | undefined) => {
    if (!data) return 0;
    return data.reduce((acc, curr) => acc + (curr.upvotes || 0) + (curr.downvotes || 0), 0);
  };

  const getTotalParticipants = (data: VoteData[] | undefined) => {
    if (!data) return 0;
    const uniqueQuestionnaires = new Set(data.map(vote => vote.questionnaire_id));
    return uniqueQuestionnaires.size;
  };

  const chartConfig = {
    total: {
      color: "#3B82F6",
    },
  };

  const renderVoteList = (type: string) => {
    const data = processDataForChart(voteData, type);
    return (
      <div className="mb-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{item.text}</span>
            </div>
            <div className="flex items-center">
              <div className="w-12 text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {item.total}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Análise de Votos</h1>
            <p className="text-gray-500">Visualização detalhada dos votos por questionário</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Participantes</p>
                      <h3 className="text-xl font-bold text-gray-900">{getTotalParticipants(voteData)}</h3>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Vote className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Votos</p>
                      <h3 className="text-xl font-bold text-gray-900">{getTotalVotes(voteData)}</h3>
                    </div>
                  </div>
                </Card>
              </div>

              <Tabs defaultValue="strengths" className="space-y-4">
                <TabsList className="bg-white p-1 rounded-lg">
                  <TabsTrigger value="strengths" className="data-[state=active]:bg-blue-50">
                    Pontos Fortes
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="data-[state=active]:bg-blue-50">
                    Desafios
                  </TabsTrigger>
                  <TabsTrigger value="opportunities" className="data-[state=active]:bg-blue-50">
                    Oportunidades
                  </TabsTrigger>
                </TabsList>

                {["strengths", "challenges", "opportunities"].map((type) => (
                  <TabsContent key={type} value={type}>
                    <Card className="p-4">
                      <h2 className="text-lg font-semibold mb-4">
                        {type === "strengths" && "Análise dos Pontos Fortes"}
                        {type === "challenges" && "Análise dos Desafios"}
                        {type === "opportunities" && "Análise das Oportunidades"}
                      </h2>
                      
                      {renderVoteList(type)}

                      <div className="h-[200px] mt-4">
                        <ChartContainer config={chartConfig}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={processDataForChart(voteData, type)}
                              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                              barSize={16}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="optionNumber" fontSize={12} />
                              <YAxis fontSize={12} />
                              <ChartTooltip
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  return (
                                    <ChartTooltipContent
                                      className="bg-white p-2 shadow-lg rounded-lg border"
                                      payload={payload}
                                    />
                                  );
                                }}
                              />
                              <Bar 
                                dataKey="total" 
                                name="Total" 
                                fill={chartConfig.total.color}
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default QuestionnaireAnalytics;
