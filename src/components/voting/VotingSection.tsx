import { Card } from "@/components/ui/card";
import { VoteButtons } from "@/components/VoteButtons";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface VotingSectionProps {
  title: string;
  type: 'strengths' | 'challenges' | 'opportunities';
  bgColor: string;
  content: string;
  onVote: (optionNumber: number) => void;
  selectedOptions: number[];
  maxSelections?: number;
}

export const VotingSection = ({
  title,
  type,
  bgColor,
  content,
  onVote,
  selectedOptions,
  maxSelections = 3
}: VotingSectionProps) => {
  const options = content.split('\n\n').filter(Boolean);
  const remainingVotes = maxSelections - selectedOptions.length;

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
          {options.map((text, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <p className="flex-1 text-sm">{text}</p>
              <VoteButtons
                isSelected={selectedOptions.includes(index + 1)}
                onVote={() => onVote(index + 1)}
                disabled={selectedOptions.length >= maxSelections && !selectedOptions.includes(index + 1)}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};