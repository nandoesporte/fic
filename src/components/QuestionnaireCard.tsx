import { Card } from "@/components/ui/card";
import { VoteButtons } from "./VoteButtons";

interface QuestionnaireCardProps {
  questionnaire: any;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number, voteType: 'upvote' | 'downvote') => void;
}

export const QuestionnaireCard = ({ questionnaire, onVote }: QuestionnaireCardProps) => {
  const splitText = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim() !== '');
  };

  const getVoteCounts = (optionType: string, optionNumber: number) => {
    const votes = questionnaire.questionnaire_vote_counts?.find(
      (v: any) => v.option_type === optionType && v.option_number === optionNumber
    );
    return {
      upvotes: votes?.upvotes || 0,
      downvotes: votes?.downvotes || 0,
    };
  };

  const getBgColor = (title: string) => {
    switch (title) {
      case "Pontos Fortes":
        return "bg-[#228B22]";
      case "Desafios":
        return "bg-[#FFD700]";
      case "Oportunidades":
        return "bg-[#000080]";
      default:
        return "";
    }
  };

  const getTextColor = (title: string) => {
    return title === "Desafios" ? "text-gray-900" : "text-white";
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-medium text-lg">
          Dimensão: {questionnaire.dimension}
        </h3>
        <p className="text-sm text-gray-500">
          Enviado em: {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Pontos Fortes")} ${getTextColor("Pontos Fortes")}`}>
            Pontos Fortes
          </h4>
          <div className="space-y-2 mt-2">
            {splitText(questionnaire.strengths).map((strength, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="flex-1">{strength}</p>
                <VoteButtons
                  {...getVoteCounts('strengths', index + 1)}
                  onVote={(voteType) => onVote('strengths', index + 1, voteType)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Desafios")} ${getTextColor("Desafios")}`}>
            Desafios
          </h4>
          <div className="space-y-2 mt-2">
            {splitText(questionnaire.challenges).map((challenge, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="flex-1">{challenge}</p>
                <VoteButtons
                  {...getVoteCounts('challenges', index + 1)}
                  onVote={(voteType) => onVote('challenges', index + 1, voteType)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`font-medium p-2 rounded-lg ${getBgColor("Oportunidades")} ${getTextColor("Oportunidades")}`}>
            Oportunidades
          </h4>
          <div className="space-y-2 mt-2">
            {splitText(questionnaire.opportunities).map((opportunity, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="flex-1">{opportunity}</p>
                <VoteButtons
                  {...getVoteCounts('opportunities', index + 1)}
                  onVote={(voteType) => onVote('opportunities', index + 1, voteType)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};