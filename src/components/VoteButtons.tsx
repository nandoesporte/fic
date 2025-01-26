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
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onVote}
      disabled={disabled}
      className={`${isSelected ? "bg-primary hover:bg-primary/90" : ""} transition-colors`}
    >
      <CheckSquare className={`h-4 w-4 mr-1 ${isSelected ? "text-white" : "text-gray-400"}`} />
      {isSelected ? "Selecionado" : "Selecionar"}
    </Button>
  );
};