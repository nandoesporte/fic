import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  onVote: (voteType: 'upvote' | 'downvote') => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export const VoteButtons = ({ upvotes, downvotes, onVote, isSelected, disabled }: VoteButtonsProps) => {
  const totalVotes = upvotes - downvotes;
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        onClick={() => onVote('upvote')}
        disabled={disabled}
        className={isSelected ? "bg-green-600 hover:bg-green-700" : ""}
      >
        <CheckSquare className="h-4 w-4 mr-1" />
        {totalVotes}
      </Button>
    </div>
  );
};