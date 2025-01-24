import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Vote, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VoteData = {
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  upvotes: number;
  downvotes: number;
  dimension?: string;
  satisfaction?: number;
  option_text?: string;
  fic_questionnaires?: {
    dimension: string;
    satisfaction: number;
    strengths: string;
    challenges: string;
    opportunities: string;
  };
};

const QuestionnaireAnalytics = () => {
  const [selectedDimension, setSelectedDimension] = React.useState<string>("all");

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

  const { data: voteData, isLoading } = useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data...");
      let query = supabase
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
        `)
        .filter('upvotes', 'gt', 0)
        .order('upvotes', { ascending: false });

      if (selectedDimension && selectedDimension !== "all") {
        query = query.eq('fic_questionnaires.dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        throw error;
      }

      console.log("Raw vote data:", votes);

      const processedVotes = votes?.map((vote) => {
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
      }) || [];

      console.log("Processed vote data:", processedVotes);
      return processedVotes;
    },
  });

  const processDataForChart = (data: VoteData[] | undefined, type: string) => {
    if (!data) return [];
    
    return data
      .filter(item => item.option_type === type)
      .map(item => ({
        optionNumber: `Opção ${item.option_number}`,
        total: (item.upvotes || 0),
        text: item.option_text || "",
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getTotalVotes = (data: VoteData[] | undefined) => {
    if (!data) return 0;
    return data.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);
  };

  const getTotalParticipants = (data: VoteData[] | undefined) => {
    if (!data) return 0;
    const uniqueQuestionnaires = new Set(
      data.map(vote => vote.questionnaire_id)
        .filter(id => {
          const vote = data.find(v => v.questionnaire_id === id);
          return vote?.fic_questionnaires?.dimension === selectedDimension || selectedDimension === "all";
        })
    );
    return uniqueQuestionnaires.size;
  };

  const renderVoteList = (type: string) => {
    const data = processDataForChart(voteData, type);
    const getBgColor = () => {
      switch (type) {
        case "strengths":
          return "bg-[#2F855A] text-white shadow-lg hover:shadow-xl transition-all duration-300";
        case "challenges":
          return "bg-[#FFD700] text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300";
        case "opportunities":
          return "bg-[#000080] text-white shadow-lg hover:shadow-xl transition-all duration-300";
        default:
          return "bg-white text-gray-900";
      }
    };

    return (
      <div className="mb-4 space-y-3">
        {data.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-5 rounded-lg ${getBgColor()}`}
          >
            <div className="flex-1">
              <span className="text-sm font-medium">{item.text}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs opacity-75">Total de votos</span>
                <p className="font-bold">{item.total}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Participantes</p>
                  <h3 className="text-2xl font-bold text-gray-900">{getTotalParticipants(voteData)}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Vote className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Votos</p>
                  <h3 className="text-2xl font-bold text-gray-900">{getTotalVotes(voteData)}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">Filtrar por Dimensão</p>
                  <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as dimensões" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as dimensões</SelectItem>
                      {dimensions?.map((dim) => (
                        <SelectItem key={dim.identifier} value={dim.identifier}>
                          {dim.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
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
                  {renderVoteList(type)}
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