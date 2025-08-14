import { Card } from "@/components/ui/card";
import { useCooperativeSettings } from "@/hooks/useCooperativeSettings";

const CooperativeImageCard = ({ 
  imageUrl,
  altText
}: { 
  imageUrl?: string;
  altText: string;
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow h-48 flex items-center justify-center">
    {imageUrl ? (
      <img 
        src={imageUrl} 
        alt={altText}
        className="max-w-full max-h-full object-contain"
      />
    ) : (
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-2">🏢</div>
        <p className="text-sm">Logo da Cooperativa</p>
      </div>
    )}
  </Card>
);

export const DashboardCooperatives = () => {
  const { cooperativeImages, loading } = useCooperativeSettings();

  if (loading || !cooperativeImages) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="p-6 h-48">
            <div className="animate-pulse">
              <div className="h-full bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CooperativeImageCard 
        imageUrl={cooperativeImages?.image1} 
        altText="Cooperativa 1"
      />
      <CooperativeImageCard 
        imageUrl={cooperativeImages?.image2} 
        altText="Cooperativa 2"
      />
      <CooperativeImageCard 
        imageUrl={cooperativeImages?.image3} 
        altText="Cooperativa 3"
      />
      <CooperativeImageCard 
        imageUrl={cooperativeImages?.image4} 
        altText="Cooperativa 4"
      />
    </div>
  );
};