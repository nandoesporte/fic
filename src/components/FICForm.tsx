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
  group: z.string({
    required_error: "Por favor selecione um grupo.",
  }),
  dimension: z.string({
    required_error: "Por favor selecione uma dimensão.",
  }),
  strengths1: z.string().min(10, {
    message: "O primeiro ponto forte deve ter pelo menos 10 caracteres.",
  }),
  strengths2: z.string().min(10, {
    message: "O segundo ponto forte deve ter pelo menos 10 caracteres.",
  }),
  strengths3: z.string().min(10, {
    message: "O terceiro ponto forte deve ter pelo menos 10 caracteres.",
  }),
  challenges1: z.string().min(10, {
    message: "O primeiro desafio deve ter pelo menos 10 caracteres.",
  }),
  challenges2: z.string().min(10, {
    message: "O segundo desafio deve ter pelo menos 10 caracteres.",
  }),
  challenges3: z.string().min(10, {
    message: "O terceiro desafio deve ter pelo menos 10 caracteres.",
  }),
  opportunities1: z.string().min(10, {
    message: "A primeira oportunidade deve ter pelo menos 10 caracteres.",
  }),
  opportunities2: z.string().min(10, {
    message: "A segunda oportunidade deve ter pelo menos 10 caracteres.",
  }),
  opportunities3: z.string().min(10, {
    message: "A terceira oportunidade deve ter pelo menos 10 caracteres.",
  }),
});

const dimensions = [
  { id: "bem-estar", label: "Bem-estar" },
  { id: "desenvolvimento", label: "Desenvolvimento Humano" },
  { id: "qualidade-vida", label: "Qualidade de Vida" },
  { id: "relacoes", label: "Relações Interpessoais" },
  { id: "impacto-social", label: "Impacto Social" },
];

const groups = [
  { id: "grupo-1", label: "Grupo 1" },
  { id: "grupo-2", label: "Grupo 2" },
  { id: "grupo-3", label: "Grupo 3" },
  { id: "grupo-4", label: "Grupo 4" },
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
      strengths1: "",
      strengths2: "",
      strengths3: "",
      challenges1: "",
      challenges2: "",
      challenges3: "",
      opportunities1: "",
      opportunities2: "",
      opportunities3: "",
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
        group: values.group,
        satisfaction: 0,
        strengths: [values.strengths1, values.strengths2, values.strengths3].join('\n\n'),
        challenges: [values.challenges1, values.challenges2, values.challenges3].join('\n\n'),
        opportunities: [values.opportunities1, values.opportunities2, values.opportunities3].join('\n\n'),
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

  const renderTextAreas = (fieldName: string, label: string, description: string) => {
    const getBgColor = (label: string) => {
      switch (label) {
        case "Pontos Fortes":
          return "bg-[#228B22]"; // Forest green background
        case "Desafios":
          return "bg-[#FFD700]"; // Gold yellow background
        case "Oportunidades":
          return "bg-[#000080]"; // Navy blue background
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Escolha o grupo ao qual você pertence
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {renderTextAreas(
            "strengths",
            "Pontos Fortes",
            "Compartilhe os elementos que contribuem positivamente para sua experiência."
          )}

          {renderTextAreas(
            "challenges",
            "Desafios",
            "Identifique áreas que precisam de atenção ou melhorias."
          )}

          {renderTextAreas(
            "opportunities",
            "Oportunidades",
            "Sugira ideias e possibilidades para aprimorar o ambiente cooperativo."
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
        </Button>
      </form>
    </Form>
  );
