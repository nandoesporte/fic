export interface VoteSelections {
  [questionnaireId: string]: {
    strengths: number[];
    challenges: number[];
    opportunities: number[];
  };
}