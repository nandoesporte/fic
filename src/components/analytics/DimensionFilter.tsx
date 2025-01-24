import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DimensionFilterProps {
  selectedDimension: string;
  onDimensionChange: (value: string) => void;
}

export function DimensionFilter({ selectedDimension, onDimensionChange }: DimensionFilterProps) {
  const { data: dimensions } = useQuery({
    queryKey: ["dimensions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fic_dimensions")
        .select("*")
        .order("label");

      if (error) throw error;
      return data;
    },
  });

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
}