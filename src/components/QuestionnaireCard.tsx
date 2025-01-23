import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteButtons } from "@/components/VoteButtons";
import { toast } from "sonner";

interface QuestionnaireVoteCounts {
  option_type: string;
  option_number: number;
  upvotes: number;
  downvotes: number;
}

interface Questionnaire {
  id: string;
  dimension: string;
  strengths: string;
  challenges: string;
  opportunities: string;
  questionnaire_vote_counts: QuestionnaireVoteCounts[];
}

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
  onVote: (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number, voteType: 'upvote' | 'downvote') => void;
}

export const QuestionnaireCard = ({ questionnaire, onVote }: QuestionnaireCardProps) => {
  const [selectedVotes, setSelectedVotes] = useState<{
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  }>({
    strengths: [],
    challenges: [],
    opportunities: [],
  });

  const getVoteCounts = (optionType: string, optionNumber: number) => {
    const voteCount = questionnaire.questionnaire_vote_counts?.find(
      count => count.option_type === optionType && count.option_number === optionNumber
    );
    return {
      upvotes: voteCount?.upvotes || 0,
      downvotes: voteCount?.downvotes || 0,
    };
  };

  const handleVote = (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    setSelectedVotes(prev => {
      const currentSelections = prev[optionType];
      
      if (currentSelections.includes(optionNumber)) {
        // Remove selection
        return {
          ...prev,
          [optionType]: currentSelections.filter(num => num !== optionNumber)
        };
      } else if (currentSelections.length < 3) {
        // Add selection if less than 3 options are selected
        return {
          ...prev,
          [optionType]: [...currentSelections, optionNumber]
        };
      } else {
        toast.error(`Você já selecionou 3 opções em ${optionType}. Remova uma seleção antes de adicionar outra.`);
        return prev;
      }
    });
  };

  const isOptionSelected = (optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    return selectedVotes[optionType].includes(optionNumber);
  };

  const renderOptions = (text: string, optionType: 'strengths' | 'challenges' | 'opportunities', optionNumber: number) => {
    const { upvotes, downvotes } = getVoteCounts(optionType, optionNumber);
    const isSelected = isOptionSelected(optionType, optionNumber);
    const isDisabled = selectedVotes[optionType].length >= 3 && !isSelected;

    return (
      <div key={`${optionType}-${optionNumber}`} className="flex items-center justify-between p-2 border-b last:border-b-0">
        <span className="flex-1">{text}</span>
        <VoteButtons
          upvotes={upvotes}
          downvotes={downvotes}
          onVote={() => {
            handleVote(optionType, optionNumber);
            onVote(optionType, optionNumber, 'upvote');
          }}
          isSelected={isSelected}
          disabled={isDisabled}
        />
      </div>
    );
  };

  const renderSection = (title: string, content: string, type: 'strengths' | 'challenges' | 'opportunities') => {
    const options = content.split('\n').filter(Boolean);
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">
          {title} 
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Selecione exatamente 3 opções - {selectedVotes[type].length}/3)
          </span>
        </h3>
        <div className="space-y-1">
          {options.map((option, index) => renderOptions(option, type, index + 1))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionário - {questionnaire.dimension}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSection("Pontos Fortes", questionnaire.strengths, "strengths")}
        {renderSection("Desafios", questionnaire.challenges, "challenges")}
        {renderSection("Oportunidades", questionnaire.opportunities, "opportunities")}
      </CardContent>
    </Card>
  );
};