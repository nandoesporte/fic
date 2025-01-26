import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DashboardHeaderProps {
  onNewQuestionnaire: () => void;
}

export const DashboardHeader = ({ onNewQuestionnaire }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          Dashboard FIC
          <Sparkles className="h-7 w-7 text-yellow-400" />
        </h1>
        <p className="text-gray-500 mt-3">
          Bem-vindo ao Sistema de Felicidade Interna do Cooperativismo
        </p>
      </div>
      <Button 
        className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all px-6"
        onClick={onNewQuestionnaire}
      >
        <PlusCircle className="h-5 w-5 mr-3" />
        Novo Questionário
      </Button>
    </div>
  );
};