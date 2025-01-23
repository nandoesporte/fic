import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { GroupSelect } from "./FICForm/GroupSelect";
import { DimensionSelect } from "./FICForm/DimensionSelect";
import { SatisfactionSelect } from "./FICForm/SatisfactionSelect";
import { TextAreaSection } from "./FICForm/TextAreaSection";
import { formSchema, type FICFormSchema } from "./FICForm/types";

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

  const form = useForm<FICFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      satisfaction: undefined,
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

  async function onSubmit(values: FICFormSchema) {
    if (!userId) {
      toast.error("Você precisa estar logado para enviar um questionário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("fic_questionnaires").insert({
        dimension: values.dimension,
        group: values.group,
        satisfaction: values.satisfaction,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <GroupSelect form={form} />
          <DimensionSelect form={form} />
          <SatisfactionSelect form={form} />

          <TextAreaSection
            form={form}
            fieldName="strengths"
            label="Pontos Fortes"
            description="Compartilhe os elementos que contribuem positivamente para sua experiência."
          />

          <TextAreaSection
            form={form}
            fieldName="challenges"
            label="Desafios"
            description="Identifique áreas que precisam de atenção ou melhorias."
          />

          <TextAreaSection
            form={form}
            fieldName="opportunities"
            label="Oportunidades"
            description="Sugira ideias e possibilidades para aprimorar o ambiente cooperativo."
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
        </Button>
      </form>
    </Form>
  );
}