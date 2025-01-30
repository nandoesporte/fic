import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuestionnaireHeaderProps {
  dimension: string;
  createdAt: string;
}

export const QuestionnaireHeader = ({ dimension, createdAt }: QuestionnaireHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{dimension}</h2>
        <p className="text-sm text-white">
          Enviado {formatDistanceToNow(new Date(createdAt), { 
            addSuffix: true,
            locale: ptBR 
          })}
        </p>
      </div>
    </div>
  );
};