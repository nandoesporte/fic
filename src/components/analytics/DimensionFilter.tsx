import { Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DimensionFilterProps {
  selectedDimension: string;
  onDimensionChange: (value: string) => void;
  dimensions?: { identifier: string; label: string }[];
}

export const DimensionFilter = ({
  selectedDimension,
  onDimensionChange,
  dimensions,
}: DimensionFilterProps) => {
  return (
    <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-100 rounded-full">
          <Filter className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">Filtrar por Dimensão</p>
          <Select value={selectedDimension} onValueChange={onDimensionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as dimensões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as dimensões</SelectItem>
              {dimensions?.map((dim) => (
                <SelectItem key={dim.identifier} value={dim.identifier}>
                  {dim.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};