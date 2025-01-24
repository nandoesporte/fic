import { Card } from "@/components/ui/card";

interface VoteItem {
  text: string;
  total: number;
}

interface VoteListProps {
  type: "strengths" | "challenges" | "opportunities";
  data: VoteItem[];
}

export function VoteList({ type, data }: VoteListProps) {
  const getBgColor = () => {
    switch (type) {
      case "strengths":
        return "bg-[#2F855A] text-white shadow-lg hover:shadow-xl transition-all duration-300";
      case "challenges":
        return "bg-[#FFD700] text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300";
      case "opportunities":
        return "bg-[#000080] text-white shadow-lg hover:shadow-xl transition-all duration-300";
      default:
        return "bg-white text-gray-900";
    }
  };

  return (
    <div className="mb-4 space-y-3">
      {data.length === 0 ? (
        <div className={`p-5 rounded-lg ${getBgColor()}`}>
          <p className="text-center">Nenhum voto registrado ainda</p>
        </div>
      ) : (
        data.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-5 rounded-lg ${getBgColor()}`}
          >
            <div className="flex-1">
              <span className="text-sm font-medium">{item.text}</span>
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
}