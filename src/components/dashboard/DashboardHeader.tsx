import { Sparkles } from "lucide-react";

export const DashboardHeader = () => {
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
    </div>
  );
};