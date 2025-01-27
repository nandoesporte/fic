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
      <h3 className="font-semibold text-lg text-white">{title}</h3>
      <span className="text-sm text-white">
        {selectionCount}/3 seleções
      </span>
    </div>
  );
};