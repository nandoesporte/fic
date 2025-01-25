import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViewControlsProps {
  viewMode: 'cards' | 'list';
  setViewMode: (mode: 'cards' | 'list') => void;
  selectedDimension: string;
  setSelectedDimension: (dimension: string) => void;
  dimensions: string[];
}

export const ViewControls = ({
  viewMode,
  setViewMode,
  selectedDimension,
  setSelectedDimension,
  dimensions,
}: ViewControlsProps) => {
  return (
    <div className="flex justify-between items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('cards')}
          className={viewMode === 'cards' ? 'bg-primary/10' : ''}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Cards
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'bg-primary/10' : ''}
        >
          <LayoutList className="h-4 w-4 mr-2" />
          Lista
        </Button>
      </div>
      <Select value={selectedDimension} onValueChange={setSelectedDimension}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione uma dimensão" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as dimensões</SelectItem>
          {dimensions.map((dimension) => (
            <SelectItem key={dimension} value={dimension}>
              {dimension}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};