import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IndividualVote {
  id: string;
  email: string;
  questionnaire_id: string;
  option_type: string;
  option_number: number;
  vote_type: string;
  created_at: string;
  dimension: string;
  option_text: string;
}

interface IndividualVotesListProps {
  type: "strengths" | "challenges" | "opportunities";
  data: IndividualVote[];
}

export const IndividualVotesList = ({ type, data }: IndividualVotesListProps) => {
  const getBgColor = () => {
    switch (type) {
      case "strengths":
        return "bg-green-50 border-green-200";
      case "challenges":
        return "bg-yellow-50 border-yellow-200";
      case "opportunities":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "strengths":
        return "bg-green-100 text-green-800";
      case "challenges":
        return "bg-yellow-100 text-yellow-800";
      case "opportunities":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "strengths":
        return "Todos os Votos em Pontos Fortes";
      case "challenges":
        return "Todos os Votos em Desafios";
      case "opportunities":
        return "Todos os Votos em Oportunidades";
      default:
        return "Votos";
    }
  };

  if (data.length === 0) {
    return (
      <Card className={`p-6 ${getBgColor()}`}>
        <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
        <div className="text-center p-4 text-gray-500">
          Nenhum voto registrado para esta categoria
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${getBgColor()}`}>
      <h3 className="text-lg font-semibold mb-4">
        {getTitle()} ({data.length} votos)
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.map((vote) => (
          <div
            key={vote.id}
            className="flex items-start justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">
                {vote.option_text || "Texto da opção não disponível"}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Por: {vote.email}</span>
                <span>•</span>
                <span>
                  {format(new Date(vote.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={getBadgeColor()}>
                  {vote.dimension}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Opção {vote.option_number}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};