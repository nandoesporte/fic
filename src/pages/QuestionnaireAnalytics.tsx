import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Vote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type VoteData = {
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  upvotes: number;
  downvotes: number;
};

type QuestionnaireData = {
  dimension: string;
  group: string;
  strengths: string;
  challenges: string;
  opportunities: string;
};

const QuestionnaireAnalytics = () => {
  const { data: voteData, isLoading: isLoadingVotes } = useQuery({
    queryKey: ["vote-counts"],
    queryFn: async () => {
      console.log("Fetching vote counts...");
      const { data: voteCounts, error } = await supabase
        .from("questionnaire_vote_counts")
        .select("*")
        .filter("upvotes", "gt", 0);

      if (error) {
        console.error("Error fetching vote counts:", error);
        throw error;
      }

      console.log("Vote counts data:", voteCounts);
      return voteCounts as VoteData[];
    },
  });

  const { data: questionnaireData, isLoading: isLoadingQuestionnaires } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      console.log("Fetching questionnaires...");
      const { data: questionnaires, error } = await supabase
        .from("fic_questionnaires")
        .select("*");

      if (error) {
        console.error("Error fetching questionnaires:", error);
        throw error;
      }

      console.log("Questionnaires data:", questionnaires);
      return questionnaires as QuestionnaireData[];
    },
  });

  const getContentByType = (
    questionnaireId: string,
    type: "strengths" | "challenges" | "opportunities",
    optionNumber: number
  ) => {
    const questionnaire = questionnaireData?.find(
      (q) => q.dimension === questionnaireId
    );
    if (!questionnaire) return "";

    const content = questionnaire[type];
    if (!content) return "";

    const options = content.split(",");
    return options[optionNumber - 1] || "";
  };

  const groupVotesByDimension = () => {
    if (!voteData) return {};

    const grouped: Record<
      string,
      Record<string, Record<number, { upvotes: number; downvotes: number }>>
    > = {};

    voteData.forEach((vote) => {
      if (!grouped[vote.questionnaire_id]) {
        grouped[vote.questionnaire_id] = {};
      }
      if (!grouped[vote.questionnaire_id][vote.option_type]) {
        grouped[vote.questionnaire_id][vote.option_type] = {};
      }
      grouped[vote.questionnaire_id][vote.option_type][vote.option_number] = {
        upvotes: vote.upvotes,
        downvotes: vote.downvotes,
      };
    });

    return grouped;
  };

  const groupedVotes = groupVotesByDimension();

  if (isLoadingVotes || isLoadingQuestionnaires) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Análise de Votos</h1>
        <p className="text-gray-500">
          Visualize e analise os resultados das votações dos questionários FIC
        </p>
      </div>

      {Object.entries(groupedVotes).map(([dimension, optionTypes]) => (
        <Card key={dimension} className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">{dimension}</h2>
          <Tabs defaultValue="strengths" className="w-full">
            <TabsList>
              <TabsTrigger value="strengths">Pontos Fortes</TabsTrigger>
              <TabsTrigger value="challenges">Desafios</TabsTrigger>
              <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            </TabsList>

            {["strengths", "challenges", "opportunities"].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-4">
                  {optionTypes[type] &&
                    Object.entries(optionTypes[type])
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([optionNumber, votes]) => (
                        <div
                          key={optionNumber}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {getContentByType(
                                  dimension,
                                  type as "strengths" | "challenges" | "opportunities",
                                  Number(optionNumber)
                                )}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Vote className="h-4 w-4 mr-1 text-green-500" />
                                  <span>{votes.upvotes} votos positivos</span>
                                </div>
                                <div className="flex items-center">
                                  <Vote className="h-4 w-4 mr-1 text-red-500 rotate-180" />
                                  <span>{votes.downvotes} votos negativos</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      ))}
    </div>
  );
};

export default QuestionnaireAnalytics;