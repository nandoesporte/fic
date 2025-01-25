import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIReport() {
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: dimensions, isLoading } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_questionnaires')
        .select('dimension')
        .distinct();
      
      if (error) throw error;
      return data.map(d => d.dimension);
    },
  });

  const handleAnalyze = async () => {
    if (!selectedDimension) {
      toast.error("Por favor, selecione uma dimensão");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('analyze-votes', {
        body: { dimension: selectedDimension },
      });

      if (response.error) throw response.error;
      setAnalysis(response.data.analysis);
      toast.success("Análise concluída com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar análise");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatório IA</h1>
        <p className="text-gray-500 mt-2">
          Análise detalhada dos votos por dimensão usando inteligência artificial
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione a Dimensão
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
            >
              <option value="">Selecione uma dimensão...</option>
              {dimensions?.map((dimension) => (
                <option key={dimension} value={dimension}>
                  {dimension}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedDimension}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              'Gerar Análise'
            )}
          </Button>
        </div>

        {analysis && (
          <div className="mt-6 prose max-w-none">
            <div className="whitespace-pre-wrap">{analysis}</div>
          </div>
        )}
      </Card>
    </div>
  );
}