import { QuestionnaireOption } from "@/components/questionnaire/QuestionnaireOption";
import { splitOptions } from "@/lib/splitOptions";
import { Button } from "@/components/ui/button";

interface DimensionAggregatedSectionProps {
  dimension: string;
  questionnaires: any[];
  selections: {
    [key: string]: {
      strengths: number[];
      challenges: number[];
      opportunities: number[];
    };
  };
  onVote: (
    questionnaireId: string,
    optionType: "strengths" | "challenges" | "opportunities",
    optionNumber: number
  ) => void;
  onConfirmVotes: (dimension: string) => void;
  hasVotedInDimension: (dimension: string) => boolean;
}

const MAX_SELECTIONS = 3;

type SectionType = "strengths" | "challenges" | "opportunities";

const SECTION_META: Record<SectionType, { title: string; bg: string; textContrast: string }>= {
  strengths: { title: "Pontos Fortes", bg: "bg-[hsl(var(--strengths))]", textContrast: "text-white" },
  challenges: { title: "Desafios", bg: "bg-[hsl(var(--challenges))]", textContrast: "text-foreground" },
  opportunities: { title: "Oportunidades", bg: "bg-[hsl(var(--opportunities))]", textContrast: "text-white" },
};

export const DimensionAggregatedSection = ({
  dimension,
  questionnaires,
  selections,
  onVote,
  onConfirmVotes,
  hasVotedInDimension,
}: DimensionAggregatedSectionProps) => {
  const isSelected = (questionnaireId: string, type: SectionType, optionNumber: number) => {
    const qSel = selections[questionnaireId];
    const arr = qSel?.[type] || [];
    return Array.isArray(arr) && arr.includes(optionNumber);
  };

  const getSelectionCount = (questionnaireId: string, type: SectionType) => {
    const qSel = selections[questionnaireId];
    const arr = qSel?.[type] || [];
    return Array.isArray(arr) ? arr.length : 0;
  };

  const renderSection = (type: SectionType) => {
    // Build entries across all questionnaires in this dimension
    const entries = questionnaires.flatMap((q) => {
      const content = q[type] || "";
      const options = splitOptions(typeof content === "string" ? content : "");
      const statusesKey = `${type}_statuses`;
      const statuses = Array.isArray(q[statusesKey]) ? q[statusesKey] : ["pending", "pending", "pending"];

      return options
        .map((option: string, index: number) => ({
          questionnaireId: q.id as string,
          option,
          index, // original index for this questionnaire
          status: statuses[index],
        }))
        .filter((e) => e.status === "active");
    });

    if (entries.length === 0) return null;

    // Calculate total selections for this section across all questionnaires in the dimension
    const totalSelectionsInSection = questionnaires.reduce((total, q) => {
      return total + getSelectionCount(q.id, type);
    }, 0);

    const meta = SECTION_META[type];

    return (
      <section className={`rounded-2xl ${meta.bg} p-3 sm:p-4 shadow-sm`}>
        <div className={`px-4 py-3 flex items-center justify-between ${meta.textContrast}`}>
          <h3 className="text-xl font-semibold">{meta.title}</h3>
          <span className={`text-sm ${type === "challenges" ? "text-foreground" : "text-white"}`}>
            {totalSelectionsInSection}/{MAX_SELECTIONS} selecionados
          </span>
        </div>
        <div className="p-2 sm:p-4">
          <div className="grid gap-3">
            {entries.map(({ questionnaireId, option, index }) => {
              const selected = isSelected(questionnaireId, type, index + 1);
              const isDisabled = totalSelectionsInSection >= MAX_SELECTIONS && !selected;
              
              return (
                <QuestionnaireOption
                  key={`${questionnaireId}-${type}-${index}`}
                  option={option}
                  index={index}
                  isActive={true}
                  isSelected={selected}
                  onVote={() => onVote(questionnaireId, type, index + 1)}
                  disabled={isDisabled}
                  accent={type}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection("strengths")}
      {renderSection("challenges")}
      {renderSection("opportunities")}

      <div className="flex justify-end">
        {(() => {
          // Calcular totais de seleções para toda a dimensão
          let totalStrengths = 0;
          let totalChallenges = 0;
          let totalOpportunities = 0;
          
          questionnaires.forEach(q => {
            totalStrengths += getSelectionCount(q.id, 'strengths');
            totalChallenges += getSelectionCount(q.id, 'challenges');
            totalOpportunities += getSelectionCount(q.id, 'opportunities');
          });

          const isComplete = totalStrengths === MAX_SELECTIONS && 
                           totalChallenges === MAX_SELECTIONS && 
                           totalOpportunities === MAX_SELECTIONS;
          
          const hasVoted = hasVotedInDimension(dimension);

          return (
            <Button 
              onClick={() => onConfirmVotes(dimension)} 
              disabled={!isComplete || hasVoted}
              className={hasVoted ? "opacity-50" : ""}
            >
              {hasVoted ? "Já Votado" : "Confirmar Votos da Dimensão"}
            </Button>
          );
        })()}
      </div>
    </div>
  );
};
