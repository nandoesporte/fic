interface QuestionnaireSectionHeaderProps {
  title: string;
  selectionCount: number;
}

export const QuestionnaireSectionHeader = ({
  title,
  selectionCount
}: QuestionnaireSectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      <span className="text-sm">
        {selectionCount}/3 seleções
      </span>
    </div>
  );
};