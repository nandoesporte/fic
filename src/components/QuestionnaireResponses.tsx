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
  question: string;
  answer: string;
  created_at: string;
}

export const QuestionnaireResponses = () => {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const { isLoading } = useQuery({
    queryKey: ['responses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
        .select('*');

      if (error) {
        console.error(error);
        return [];
      }

      return data;
    },
    onSuccess: (data) => {
      setResponses(data);
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
                <div className="flex justify-between items-center">
                  <span>{response.question}</span>
                  <span>{response.answer}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between items-center">
                  <span>Enviado em: {new Date(response.created_at).toLocaleDateString('pt-BR')}</span>
                  <Button variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
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
