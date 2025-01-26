import { Button } from "@/components/ui/button";

interface ConfirmVoteButtonProps {
  onConfirm: () => void;
  disabled: boolean;
}

export const ConfirmVoteButton = ({ onConfirm, disabled }: ConfirmVoteButtonProps) => {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onConfirm}
        disabled={disabled}
        className="bg-primary hover:bg-primary/90"
      >
        Confirmar Votos
      </Button>
    </div>
  );
};