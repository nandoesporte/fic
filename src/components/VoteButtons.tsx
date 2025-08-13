import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

interface VoteButtonsProps {
  isSelected: boolean;
  onVote: () => void;
  disabled?: boolean;
}

export const VoteButtons = ({ isSelected, onVote, disabled }: VoteButtonsProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onVote}
      disabled={disabled}
      className="text-foreground bg-background hover:bg-accent/10 transition-colors"
    >
      <CheckSquare className="h-4 w-4 mr-1 text-foreground" />
      {isSelected ? "Selecionado" : "Selecionar"}
    </Button>
  );
};