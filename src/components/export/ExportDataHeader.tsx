interface ExportDataHeaderProps {
  title: string;
  description: string;
}

export const ExportDataHeader = ({ title, description }: ExportDataHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-1">{description}</p>
    </div>
  );
};