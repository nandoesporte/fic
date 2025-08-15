import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ConsolidatedVote {
  groupName: string;
  originalTexts: string[];
  totalVotes: number;
  category: 'strengths' | 'challenges' | 'opportunities';
}

interface ConsolidatedReportProps {
  dimension: string;
  totalVotes: number;
  uniqueVoters: number;
  strengths: ConsolidatedVote[];
  challenges: ConsolidatedVote[];
  opportunities: ConsolidatedVote[];
}

const ConsolidatedVoteCard = ({ vote }: { vote: ConsolidatedVote }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getBgColor = () => {
    switch (vote.category) {
      case "strengths":
        return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      case "challenges":
        return "bg-amber-50 border-amber-200 hover:bg-amber-100";
      case "opportunities":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getTextColor = () => {
    switch (vote.category) {
      case "strengths":
        return "text-emerald-900";
      case "challenges":
        return "text-amber-900";
      case "opportunities":
        return "text-blue-900";
      default:
        return "text-gray-900";
    }
  };

  const getBadgeColor = () => {
    switch (vote.category) {
      case "strengths":
        return "bg-emerald-600 text-white";
      case "challenges":
        return "bg-amber-600 text-white";
      case "opportunities":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`p-4 transition-all duration-200 ${getBgColor()}`}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-left flex-1">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${getTextColor()}`}>
                  {vote.groupName}
                </h4>
                {vote.originalTexts.length > 1 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {vote.originalTexts.length} variações agrupadas
                  </p>
                )}
              </div>
            </div>
            <Badge className={`${getBadgeColor()} font-bold`}>
              {vote.totalVotes} votos
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Textos originais agrupados:
            </p>
            <ul className="space-y-1">
              {vote.originalTexts.map((text, index) => (
                <li key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-300">
                  "{text}"
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export const ConsolidatedReport = ({ 
  dimension, 
  totalVotes, 
  uniqueVoters, 
  strengths, 
  challenges, 
  opportunities 
}: ConsolidatedReportProps) => {
  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Dimensão Analisada</p>
          <p className="text-xl font-bold text-gray-900">
            {dimension === 'all' ? 'Todas as Dimensões' : dimension}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Total de Votos</p>
          <p className="text-xl font-bold text-blue-600">{totalVotes}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Votantes Únicos</p>
          <p className="text-xl font-bold text-purple-600">{uniqueVoters}</p>
        </Card>
      </div>

      {/* Seções de Votos */}
      <div className="grid gap-6">
        {/* Pontos Fortes */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            💪 Pontos Fortes Consolidados
            <Badge variant="secondary">{strengths.length} grupos</Badge>
          </h3>
          <div className="space-y-3">
            {strengths.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                Nenhum voto em pontos fortes encontrado
              </Card>
            ) : (
              strengths.map((vote, index) => (
                <ConsolidatedVoteCard key={index} vote={vote} />
              ))
            )}
          </div>
        </div>

        {/* Desafios */}
        <div>
          <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
            ⚠️ Desafios Consolidados
            <Badge variant="secondary">{challenges.length} grupos</Badge>
          </h3>
          <div className="space-y-3">
            {challenges.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                Nenhum voto em desafios encontrado
              </Card>
            ) : (
              challenges.map((vote, index) => (
                <ConsolidatedVoteCard key={index} vote={vote} />
              ))
            )}
          </div>
        </div>

        {/* Oportunidades */}
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            🚀 Oportunidades Consolidadas
            <Badge variant="secondary">{opportunities.length} grupos</Badge>
          </h3>
          <div className="space-y-3">
            {opportunities.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                Nenhum voto em oportunidades encontrado
              </Card>
            ) : (
              opportunities.map((vote, index) => (
                <ConsolidatedVoteCard key={index} vote={vote} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};