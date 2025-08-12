import { Card } from "@/components/ui/card";

interface VoteOption {
  optionNumber: string;
  total: number;
  text: string;
}

interface VoteListProps {
  type: "strengths" | "challenges" | "opportunities";
  data: VoteOption[];
}

export const VoteList = ({ type, data }: VoteListProps) => {
  const getBgColor = () => {
    switch (type) {
      case "strengths":
        return "bg-[#2F855A] text-white";
      case "challenges":
        return "bg-[#FFD700] text-gray-900";
      case "opportunities":
        return "bg-[#000080] text-white";
      default:
        return "bg-white text-gray-900";
    }
  };

  // Sort data by option number to maintain consistent order
  const sortedData = [...data].sort((a, b) => 
    parseInt(a.optionNumber) - parseInt(b.optionNumber)
  );

  return (
    <div className="mb-4 space-y-3">
      {sortedData.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          Nenhum voto registrado para esta seção
        </div>
      ) : (
        sortedData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${getBgColor()}`}
          >
            <div className="flex-1">
              <span className="text-sm font-medium">{(item.text || "").trim() || "Texto da opção não disponível"}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs opacity-75">Total de votos</span>
                <p className="font-bold">{item.total}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};