import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FICFormSchema } from "./types";

const groups = [
  { id: "grupo-1", label: "Grupo 1" },
  { id: "grupo-2", label: "Grupo 2" },
  { id: "grupo-3", label: "Grupo 3" },
  { id: "grupo-4", label: "Grupo 4" },
];

interface GroupSelectProps {
  form: UseFormReturn<FICFormSchema>;
}

export function GroupSelect({ form }: GroupSelectProps) {
  return (
    <FormField
      control={form.control}
      name="group"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xl font-semibold">Grupo</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-black text-white hover:bg-black/90 transition-colors">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id} className="text-lg">
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription className="text-base">
            Escolha o grupo ao qual você pertence
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}