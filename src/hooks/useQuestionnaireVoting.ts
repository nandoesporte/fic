
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

export const useQuestionnaireVoting = (isEmailVerified: boolean, userEmail: string) => {
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
      
      // Retornar todos os questionários ativos sem consolidação
      return questionnairesData;
    },
    enabled: isEmailVerified,
  });

  // Check if user has already voted for each questionnaire
  const { data: userVotes } = useQuery({
    queryKey: ['user-votes', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const { data } = await supabase
        .from('questionnaire_votes')
        .select('questionnaire_id')
        .eq('email', userEmail.toLowerCase());
      return data || [];
    },
    enabled: isEmailVerified && !!userEmail,
  });

  const handleVote = (questionnaireId: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    const currentSelections = selections[questionnaireId] ?? { strengths: [], challenges: [], opportunities: [] };
    const sectionSelections = currentSelections[optionType] || [];
    const isSelected = sectionSelections.includes(optionNumber);

    // Enforce per-section (color) limit of 3 selections
    // Toggle off if already selected
    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [questionnaireId]: {
          ...prev[questionnaireId],
          [optionType]: sectionSelections.filter(num => num !== optionNumber)
        }
      }));
      return;
    }

    // Max 3 per section (color)
    const labels: Record<typeof optionType, string> = {
      strengths: 'Pontos Fortes',
      challenges: 'Desafios',
      opportunities: 'Oportunidades',
    };

    if (sectionSelections.length >= 3) {
      import('@/components/voting/VotingToast').then(({ votingToasts }) => {
        votingToasts.maxSelectionsReached(labels[optionType]);
      });
      return;
    }

    setSelections(prev => ({
      ...prev,
      [questionnaireId]: {
        ...prev[questionnaireId],
        [optionType]: [...sectionSelections, optionNumber]
      }
    }));
  };

  const hasVotedInDimension = (dimension: string) => {
    // Check if user has voted for any questionnaire in this dimension
    const dimensionQuestionnaires = questionnaires?.filter(q => q.dimension === dimension) || [];
    return dimensionQuestionnaires.some(q => 
      userVotes?.some(vote => vote.questionnaire_id === q.id)
    );
  };

  const hasVotedQuestionnaire = (questionnaireId: string) => {
    return userVotes?.some(vote => vote.questionnaire_id === questionnaireId) || false;
  };

  return {
    questionnaires,
    isLoading,
    selections,
    handleVote,
    setSelections,
    hasVotedInDimension,
    hasVotedQuestionnaire
  };
};
