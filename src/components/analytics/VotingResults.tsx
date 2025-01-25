import { Card } from "@/components/ui/card";
import { VoteList } from "./VoteList";

interface VotingResultsProps {
  strengths: Array<{ optionNumber: string; total: number; text: string }>;
  challenges: Array<{ optionNumber: string; total: number; text: string }>;
  opportunities: Array<{ optionNumber: string; total: number; text: string }>;
}

export const VotingResults = ({ strengths, challenges, opportunities }: VotingResultsProps) => {
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pontos Fortes Mais Votados</h3>
        <VoteList type="strengths" data={strengths} />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Desafios Mais Votados</h3>
        <VoteList type="challenges" data={challenges} />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Oportunidades Mais Votadas</h3>
        <VoteList type="opportunities" data={opportunities} />
      </Card>
    </div>
  );
};