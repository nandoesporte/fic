import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useQuestionnaireData = () => {
  return useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      console.log('Fetching questionnaires data...');
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionnairesError) {
        console.error('Error fetching questionnaires:', questionnairesError);
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      console.log('Questionnaires data fetched:', questionnairesData);
      return questionnairesData?.map(q => ({
        ...q,
        strengths_statuses: q.strengths_statuses || 'pending,pending,pending',
        challenges_statuses: q.challenges_statuses || 'pending,pending,pending',
        opportunities_statuses: q.opportunities_statuses || 'pending,pending,pending',
        status: q.status || 'pending'
      }));
    },
    refetchInterval: 5000, // Refresh every 5 seconds to get updates
  });
};