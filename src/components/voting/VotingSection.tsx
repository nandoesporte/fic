import { Card } from "@/components/ui/card";
import { VoteButtons } from "@/components/VoteButtons";

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
  return (
    <Card className="p-6 mb-4">
      <h3 className={`font-medium p-2 rounded-lg ${bgColor} ${type === 'challenges' ? 'text-gray-900' : 'text-white'} mb-4`}>
        {title}
      </h3>
      <div className="space-y-4">
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            {option.text.map((text, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <p className="flex-1 text-sm">{text}</p>
                <VoteButtons
                  isSelected={option.selections.includes(index + 1)}
                  onVote={() => onVote(option.id, type, index + 1)}
                  disabled={option.selections.length >= maxSelections && !option.selections.includes(index + 1)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};