import { Card } from "@/components/ui/card";
import { VoteButtons } from "@/components/VoteButtons";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface VotingSectionProps {
  title: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  bgColor: string;
  options: Array<{
    id: string;
    text: string[];
    selections: number[];
  }>;
  onVote: (questionnaireId: string, type: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => void;
  maxSelections?: number;
}

export const VotingSection = ({
  title,
  type,
  bgColor,
  options,
  onVote,
  maxSelections = 3
}: VotingSectionProps) => {
  const totalVotes = options.reduce((sum, option) => sum + option.selections.length, 0);
  const remainingVotes = maxSelections - totalVotes;

  return (
    <Card className="p-6 mb-4">
      <div className="space-y-4">
        <h3 className={`font-medium p-2 rounded-lg ${bgColor} ${type === 'challenges' ? 'text-gray-900' : 'text-white'} mb-4`}>
          {title}
        </h3>
        
        <Alert variant={remainingVotes === 0 ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">
            {remainingVotes === 0 
              ? "Você selecionou todos os 3 votos necessários nesta seção"
              : `Você precisa selecionar mais ${remainingVotes} ${remainingVotes === 1 ? 'voto' : 'votos'} nesta seção`}
          </span>
        </Alert>

        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              {option.text.map((text, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <p className="flex-1 text-sm">{text}</p>
                  <VoteButtons
                    isSelected={option.selections.includes(index + 1)}
                    onVote={() => onVote(option.id, type, index + 1)}
                    disabled={totalVotes >= maxSelections && !option.selections.includes(index + 1)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};