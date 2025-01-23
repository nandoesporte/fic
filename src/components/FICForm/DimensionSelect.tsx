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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DimensionSelectProps {
  form: UseFormReturn<FICFormSchema>;
}

export function DimensionSelect({ form }: DimensionSelectProps) {
  const { data: dimensions } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="dimension"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dimensão</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-[#F97316] bg-opacity-10 border-[#F97316] border-opacity-20">
                <SelectValue placeholder="Selecione uma dimensão" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {dimensions?.map((dimension) => (
                <SelectItem key={dimension.id} value={dimension.identifier}>
                  {dimension.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Escolha a dimensão do FIC que este questionário irá avaliar
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}