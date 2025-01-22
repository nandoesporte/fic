import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FICFormSchema } from "./types";

interface TextAreaSectionProps {
  form: UseFormReturn<FICFormSchema>;
  fieldName: string;
  label: string;
  description: string;
}

export function TextAreaSection({ form, fieldName, label, description }: TextAreaSectionProps) {
  const getBgColor = (label: string) => {
    switch (label) {
      case "Pontos Fortes":
        return "bg-[#228B22]";
      case "Desafios":
        return "bg-[#FFD700]";
      case "Oportunidades":
        return "bg-[#000080]";
      default:
        return "";
    }
  };

  const getTextColor = (label: string) => {
    return label === "Desafios" ? "text-gray-900" : "text-white";
  };

  return (
    <div className="space-y-4">
      <h3 className={`font-medium text-lg p-2 rounded-lg ${getBgColor(label)} ${getTextColor(label)}`}>
        {label}
      </h3>
      {[1, 2, 3].map((num) => (
        <FormField
          key={`${fieldName}${num}`}
          control={form.control}
          name={`${fieldName}${num}` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`${label} ${num}`}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Descreva ${label.toLowerCase()} ${num}...`}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <FormDescription>{description}</FormDescription>
    </div>
  );
}