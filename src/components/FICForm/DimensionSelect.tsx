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

const dimensions = [
  { id: "bem-estar", label: "Bem-estar" },
  { id: "desenvolvimento", label: "Desenvolvimento Humano" },
  { id: "qualidade-vida", label: "Qualidade de Vida" },
  { id: "relacoes", label: "Relações Interpessoais" },
  { id: "impacto-social", label: "Impacto Social" },
];

interface DimensionSelectProps {
  form: UseFormReturn<FICFormSchema>;
}

export function DimensionSelect({ form }: DimensionSelectProps) {
  return (
    <FormField
      control={form.control}
      name="dimension"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dimensão</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma dimensão" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {dimensions.map((dimension) => (
                <SelectItem key={dimension.id} value={dimension.id}>
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