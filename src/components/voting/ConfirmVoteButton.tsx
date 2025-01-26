import { Button } from "@/components/ui/button";

interface ConfirmVoteButtonProps {
  onConfirm: () => void;
  isComplete: boolean;
}

export const ConfirmVoteButton = ({ onConfirm, isComplete }: ConfirmVoteButtonProps) => {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onConfirm}
        disabled={!isComplete}
        className="bg-primary hover:bg-primary/90"
      >
        Confirmar Votos
      </Button>
    </div>
  );
};