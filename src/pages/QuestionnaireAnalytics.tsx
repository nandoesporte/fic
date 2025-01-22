import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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

      // Process the data to include the option text
      const processedVotes = votes.map((vote) => {
        let optionText = "";
        if (vote.fic_questionnaires) {
          const options = vote.option_type === "strengths" 
            ? vote.fic_questionnaires.strengths
            : vote.option_type === "challenges"
              ? vote.fic_questionnaires.challenges
              : vote.fic_questionnaires.opportunities;
          
          const optionsList = options?.split('\n').filter(Boolean) || [];
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

  const chartConfig = {
    upvotes: {
      color: "#22C55E",
    },
    downvotes: {
      color: "#EF4444",
    },
    total: {
      color: "#3B82F6",
    },
  };

  const renderVoteList = (type: string) => {
    const data = processDataForChart(voteData, type);
    return (
      <div className="mb-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{item.text}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">+{item.upvotes}</span>
                <span className="text-sm font-medium text-red-600">-{item.downvotes}</span>
              </div>
              <div className="w-20 text-right">
                <span className={`text-sm font-bold ${item.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.total >= 0 ? '+' : ''}{item.total}
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
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Análise de Votos</h1>
            <p className="text-gray-500">Visualização detalhada dos votos por questionário</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <Tabs defaultValue="strengths" className="space-y-6">
              <TabsList>
                <TabsTrigger value="strengths">Pontos Fortes</TabsTrigger>
                <TabsTrigger value="challenges">Desafios</TabsTrigger>
                <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
              </TabsList>

              {["strengths", "challenges", "opportunities"].map((type) => (
                <TabsContent key={type} value={type}>
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">
                      {type === "strengths" && "Análise dos Pontos Fortes"}
                      {type === "challenges" && "Análise dos Desafios"}
                      {type === "opportunities" && "Análise das Oportunidades"}
                    </h2>
                    
                    {renderVoteList(type)}

                    <div className="h-[400px]">
                      <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={processDataForChart(voteData, type)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="optionNumber" />
                            <YAxis />
                            <Tooltip
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
                            <Legend />
                            <Bar dataKey="upvotes" name="Votos Positivos" fill={chartConfig.upvotes.color} />
                            <Bar dataKey="downvotes" name="Votos Negativos" fill={chartConfig.downvotes.color} />
                            <Bar dataKey="total" name="Saldo" fill={chartConfig.total.color} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default QuestionnaireAnalytics;