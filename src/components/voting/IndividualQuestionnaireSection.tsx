import { QuestionnaireOption } from "@/components/questionnaire/QuestionnaireOption";
import { splitOptions } from "@/lib/splitOptions";
import { Button } from "@/components/ui/button";
import { votingToasts } from "./VotingToast";

interface IndividualQuestionnaireSectionProps {
  questionnaire: any;
  selections: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
  onVote: (
    questionnaireId: string,
    optionType: "strengths" | "challenges" | "opportunities",
    optionNumber: number
  ) => void;
  onConfirmVotes: (questionnaireId: string) => void;
  hasVotedQuestionnaire: (questionnaireId: string) => boolean;
}

const MAX_SELECTIONS = 3;

type SectionType = "strengths" | "challenges" | "opportunities";

const SECTION_META: Record<SectionType, { title: string; bg: string; textContrast: string }>= {
  strengths: { title: "Pontos Fortes", bg: "bg-[hsl(var(--strengths))]", textContrast: "text-white" },
  challenges: { title: "Desafios", bg: "bg-[hsl(var(--challenges))]", textContrast: "text-foreground" },
  opportunities: { title: "Oportunidades", bg: "bg-[hsl(var(--opportunities))]", textContrast: "text-white" },
};

export const IndividualQuestionnaireSection = ({
  questionnaire,
  selections,
  onVote,
  onConfirmVotes,
  hasVotedQuestionnaire,
}: IndividualQuestionnaireSectionProps) => {
  const isSelected = (type: SectionType, optionNumber: number) => {
    const arr = selections[type] || [];
    return Array.isArray(arr) && arr.includes(optionNumber);
  };

  const getSelectionCount = (type: SectionType) => {
    const arr = selections[type] || [];
    return Array.isArray(arr) ? arr.length : 0;
  };

  const renderSection = (type: SectionType) => {
    const content = questionnaire[type] || "";
    const options = splitOptions(typeof content === "string" ? content : "");
    const statusesKey = `${type}_statuses`;
    const statuses = Array.isArray(questionnaire[statusesKey]) ? questionnaire[statusesKey] : ["pending", "pending", "pending"];

    const activeOptions = options
      .map((option: string, index: number) => ({
        option,
        index,
        status: statuses[index],
      }))
      .filter((e) => e.status === "active");

    if (activeOptions.length === 0) return null;

    const totalSelectionsInSection = getSelectionCount(type);
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
            {activeOptions.map(({ option, index }) => {
              const selected = isSelected(type, index + 1);
              const isDisabled = totalSelectionsInSection >= MAX_SELECTIONS && !selected;
              
              return (
                <QuestionnaireOption
                  key={`${questionnaire.id}-${type}-${index}`}
                  option={option}
                  index={index}
                  isActive={true}
                  isSelected={selected}
                  onVote={() => onVote(questionnaire.id, type, index + 1)}
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

  const totalStrengths = getSelectionCount('strengths');
  const totalChallenges = getSelectionCount('challenges');
  const totalOpportunities = getSelectionCount('opportunities');

  const isComplete = totalStrengths === MAX_SELECTIONS && 
                   totalChallenges === MAX_SELECTIONS && 
                   totalOpportunities === MAX_SELECTIONS;
  
  const hasVoted = hasVotedQuestionnaire(questionnaire.id);

  return (
    <div className="space-y-6 border rounded-lg p-6 bg-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Questionário: {questionnaire.group || `ID: ${questionnaire.id.slice(0, 8)}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          Dimensão: {questionnaire.dimension}
        </p>
      </div>

      {renderSection("strengths")}
      {renderSection("challenges")}
      {renderSection("opportunities")}

      <div className="flex justify-end">
        <Button 
          onClick={() => {
            if (hasVoted) {
              votingToasts.alreadyVoted(questionnaire.dimension);
            } else if (!isComplete) {
              votingToasts.incompleteVotes();
            } else {
              onConfirmVotes(questionnaire.id);
            }
          }} 
          disabled={!isComplete || hasVoted}
          className={hasVoted ? "opacity-50" : ""}
        >
          {hasVoted ? "Já Votado" : "Confirmar Votos do Questionário"}
        </Button>
      </div>
    </div>
  );
};