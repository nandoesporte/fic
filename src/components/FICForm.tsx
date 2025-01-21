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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const formSchema = z.object({
  dimension: z.string({
    required_error: "Por favor selecione uma dimensão.",
  }),
  satisfaction: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Por favor selecione seu nível de satisfação.",
  }),
  strengths: z.string().min(10, {
    message: "Os pontos fortes devem ter pelo menos 10 caracteres.",
  }),
  challenges: z.string().min(10, {
    message: "Os desafios devem ter pelo menos 10 caracteres.",
  }),
  opportunities: z.string().min(10, {
    message: "As oportunidades devem ter pelo menos 10 caracteres.",
  }),
});

const dimensions = [
  { id: "bem-estar", label: "Bem-estar" },
  { id: "desenvolvimento", label: "Desenvolvimento Humano" },
  { id: "qualidade-vida", label: "Qualidade de Vida" },
  { id: "relacoes", label: "Relações Interpessoais" },
  { id: "impacto-social", label: "Impacto Social" },
];

export function FICForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strengths: "",
      challenges: "",
      opportunities: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast.error("Você precisa estar logado para enviar um questionário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("fic_questionnaires").insert({
        dimension: values.dimension,
        satisfaction: parseInt(values.satisfaction),
        strengths: values.strengths,
        challenges: values.challenges,
        opportunities: values.opportunities,
        user_id: userId,
      });

      if (error) throw error;

      toast.success("Questionário enviado com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar questionário:", error);
      toast.error("Erro ao enviar questionário. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
        </Button>
      </form>
    </Form>
  );
}