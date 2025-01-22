import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

interface QuestionnaireResponse {
  id: string;
  dimension: string;
  satisfaction: number;
  strengths: string;
  challenges: string;
  opportunities: string;
  created_at: string;
  group: string | null;
  group_name: string | null;
}

export const QuestionnaireResponses = () => {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  
  const { isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_questionnaires')
        .select('*');

      if (error) {
        console.error('Error fetching questionnaires:', error);
        throw error;
      }

      setResponses(data || []);
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Respostas do Questionário</h2>
        <Link to="/voting">
          <Button variant="outline" className="gap-2">
            Ir para página de votação
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Accordion type="single" collapsible>
          {responses.map((response) => (
            <AccordionItem key={response.id} value={response.id}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4">
                    {response.group && (
                      <span className="bg-black text-white px-3 py-1 rounded-full text-lg">
                        {response.group}
                      </span>
                    )}
                    <span>{response.dimension}</span>
                  </div>
                  <span>Satisfação: {response.satisfaction}/10</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Pontos Fortes:</h3>
                    <p>{response.strengths}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Desafios:</h3>
                    <p>{response.challenges}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Oportunidades:</h3>
                    <p>{response.opportunities}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span>Enviado em: {new Date(response.created_at).toLocaleDateString('pt-BR')}</span>
                    <Button variant="outline" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default QuestionnaireResponses;