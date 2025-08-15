import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VoteGroup {
  text: string;
  votes: number;
  variations: string[];
}

interface AIVotingResultsProps {
  strengths: VoteGroup[];
  challenges: VoteGroup[];
  opportunities: VoteGroup[];
}

export const AIVotingResults = ({ strengths, challenges, opportunities }: AIVotingResultsProps) => {
  const renderVoteGroup = (groups: VoteGroup[], title: string, bgColor: string, textColor: string) => {
    if (groups.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          Nenhum voto registrado para esta seção
        </div>
      );
    }

    const totalVotes = groups.reduce((sum, group) => sum + group.votes, 0);

    return (
      <div className="space-y-3">
        {groups.map((group, index) => {
          const percentage = totalVotes > 0 ? Math.round((group.votes / totalVotes) * 100) : 0;
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${bgColor} ${textColor}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{group.text}</span>
                  {group.variations.length > 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 opacity-70 hover:opacity-100" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium mb-1">Variações agrupadas:</p>
                          <ul className="text-xs space-y-1">
                            {group.variations.map((variation, i) => (
                              <li key={i}>• {variation}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {group.variations.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {group.variations.length} variações agrupadas
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs opacity-75">Total de votos</span>
                  <p className="font-bold">{percentage}% • {group.votes}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>Pontos Fortes Mais Votados</span>
          <Badge variant="outline" className="text-xs">
            IA Agrupada
          </Badge>
        </h3>
        {renderVoteGroup(strengths, "Pontos Fortes", "bg-[#2F855A]", "text-white")}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>Desafios Mais Votados</span>
          <Badge variant="outline" className="text-xs">
            IA Agrupada
          </Badge>
        </h3>
        {renderVoteGroup(challenges, "Desafios", "bg-[#FFD700]", "text-gray-900")}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>Oportunidades Mais Votadas</span>
          <Badge variant="outline" className="text-xs">
            IA Agrupada
          </Badge>
        </h3>
        {renderVoteGroup(opportunities, "Oportunidades", "bg-[#000080]", "text-white")}
      </Card>
    </div>
  );
};