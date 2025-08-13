
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type VoteSelection = {
  [key: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
};

export const useQuestionnaireVoting = (isEmailVerified: boolean) => {
  const [selections, setSelections] = useState<VoteSelection>({});

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      console.log('Fetching questionnaires data...');
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('fic_questionnaires')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (questionnairesError) {
        toast.error('Erro ao carregar questionários');
        throw questionnairesError;
      }

      console.log('Questionnaires data fetched:', questionnairesData);
      
      // Consolidate questionnaires by group using the most recently updated record
      const consolidatedByGroup = questionnairesData.reduce((acc: { [key: string]: any }, curr) => {
        if (!curr.group) return acc;
        const existing = acc[curr.group];
        const isNewer = !existing || new Date(curr.updated_at) > new Date(existing.updated_at);
        if (isNewer) {
          acc[curr.group] = {
            id: curr.id,
            dimension: curr.dimension,
            strengths: curr.strengths,
            challenges: curr.challenges,
            opportunities: curr.opportunities,
            created_at: curr.created_at,
            updated_at: curr.updated_at,
            strengths_statuses: curr.strengths_statuses,
            challenges_statuses: curr.challenges_statuses,
            opportunities_statuses: curr.opportunities_statuses,
            group: curr.group
          };
        }
        return acc;
      }, {});

      return Object.values(consolidatedByGroup);
    },
    enabled: isEmailVerified,
  });

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    const currentSelections = selections[questionnaireId]?.[optionType] || [];
    const isSelected = currentSelections.includes(optionNumber);

    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: currentSelections.filter(num => num !== optionNumber)
        }
      }));
    } else {
      if (currentSelections.length >= 3) {
        toast.error('Você já selecionou 3 opções nesta seção. Remova uma seleção para escolher outra.');
        return;
      }

      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: [...currentSelections, optionNumber]
        }
      }));
    }
  };

  return {
    questionnaires,
    isLoading,
    selections,
    handleVote,
    setSelections
  };
};
