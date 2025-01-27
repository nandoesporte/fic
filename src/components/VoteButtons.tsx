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
      className={`${
        isSelected 
          ? "bg-[#9b87f5] hover:bg-[#7E69AB] border-[#9b87f5]" 
          : "hover:bg-[#9b87f5]/10 border-[#D6BCFA]"
      } transition-colors`}
    >
      <CheckSquare className={`h-4 w-4 mr-1 ${
        isSelected ? "text-white" : "text-[#7E69AB]"
      }`} />
      {isSelected ? "Selecionado" : "Selecionar"}
    </Button>
  );
};