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

interface SatisfactionSelectProps {
  form: UseFormReturn<FICFormSchema>;
}

export function SatisfactionSelect({ form }: SatisfactionSelectProps) {
  return (
    <FormField
      control={form.control}
      name="satisfaction"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nível de Satisfação</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(parseInt(value))}
            defaultValue={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de satisfação" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Avalie seu nível de satisfação de 1 a 10
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}