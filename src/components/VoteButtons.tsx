import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  onVote: (voteType: 'upvote' | 'downvote') => void;
}

export const VoteButtons = ({ upvotes, downvotes, onVote }: VoteButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVote('upvote')}
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        {upvotes}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVote('downvote')}
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        {downvotes}
      </Button>
    </div>
  );
};