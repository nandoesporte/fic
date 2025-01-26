import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireVotes = (selectedDimension: string) => {
  return useQuery({
    queryKey: ["questionnaire-votes", selectedDimension],
    queryFn: async () => {
      console.log("Fetching vote data for dimension:", selectedDimension);
      
      // Primeiro, obter todos os questionários com seus votos
      let query = supabase
        .from('questionnaire_votes')
        .select(`
          id,
          questionnaire_id,
          vote_type,
          option_type,
          option_number,
          fic_questionnaires!inner (
            dimension,
            strengths,
            challenges,
            opportunities
          )
        `);

      // Aplicar filtro de dimensão se não for "all"
      if (selectedDimension !== "all") {
        query = query.eq('fic_questionnaires.dimension', selectedDimension);
      }

      const { data: votes, error } = await query;

      if (error) {
        console.error("Error fetching votes:", error);
        throw error;
      }

      console.log("Raw votes data:", votes);

      // Inicializar contadores de votos para cada categoria
      const voteCounters: Record<string, Record<number, number>> = {
        strengths: {},
        challenges: {},
        opportunities: {}
      };

      // Contar votos para cada opção
      votes?.forEach(vote => {
        const { option_type, option_number } = vote;
        
        if (!voteCounters[option_type][option_number]) {
          voteCounters[option_type][option_number] = 0;
        }
        
        voteCounters[option_type][option_number]++;
      });

      console.log("Vote counters:", voteCounters);

      // Obter o texto do conteúdo de cada opção do primeiro questionário
      const sampleQuestionnaire = votes?.[0]?.fic_questionnaires;
      
      // Formatar resultados com o texto do conteúdo
      const formatResults = (type: 'strengths' | 'challenges' | 'opportunities') => {
        return Object.entries(voteCounters[type]).map(([optionNumber, total]) => {
          const options = sampleQuestionnaire?.[type]?.split('\n\n') || [];
          return {
            optionNumber: String(optionNumber),
            total,
            text: options[parseInt(optionNumber) - 1] || `Opção ${optionNumber}`
          };
        });
      };

      const results = {
        strengths: formatResults('strengths'),
        challenges: formatResults('challenges'),
        opportunities: formatResults('opportunities')
      };

      console.log("Processed vote data:", results);
      return results;
    },
  });
};