import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const formSchema = z.object({
  strengths: z.string().min(10, {
    message: "Os pontos fortes devem ter pelo menos 10 caracteres.",
  }),
  challenges: z.string().min(10, {
    message: "Os desafios devem ter pelo menos 10 caracteres.",
  }),
  opportunities: z.string().min(10, {
    message: "As oportunidades devem ter pelo menos 10 caracteres.",
  }),
  satisfaction: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Por favor selecione seu nível de satisfação.",
  }),
});

export function FICForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strengths: "",
      challenges: "",
      opportunities: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success("Formulário enviado com sucesso!");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="satisfaction"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Nível de Satisfação Geral</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <FormItem
                        key={value}
                        className="flex items-center space-x-2"
                      >
                        <FormControl>
                          <RadioGroupItem value={value.toString()} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {value}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  1 = Muito insatisfeito, 5 = Muito satisfeito
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strengths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pontos Fortes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva os aspectos positivos que você identifica no ambiente cooperativo..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Compartilhe os elementos que contribuem positivamente para sua experiência.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="challenges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desafios</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Quais são os principais desafios que você enfrenta..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Identifique áreas que precisam de atenção ou melhorias.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="opportunities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oportunidades</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Que oportunidades você vê para melhorar a felicidade na cooperativa..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Sugira ideias e possibilidades para aprimorar o ambiente cooperativo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Enviar Avaliação
        </Button>
      </form>
    </Form>
  );
}