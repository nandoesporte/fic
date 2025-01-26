import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VoteSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h1 className="text-3xl font-bold text-green-600">
            Votos Confirmados!
          </h1>
          <p className="text-gray-600">
            Seus votos foram registrados com sucesso. Obrigado pela sua participação!
          </p>
          <Button
            onClick={() => navigate("/voting")}
            className="w-full"
          >
            Voltar para Votação
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoteSuccess;