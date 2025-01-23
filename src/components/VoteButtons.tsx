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
      className={isSelected ? "bg-primary/10" : ""}
    >
      <CheckSquare className={`h-4 w-4 mr-1 ${isSelected ? "text-primary" : "text-gray-400"}`} />
      {isSelected ? "Selecionado" : "Selecionar"}
    </Button>
  );
};