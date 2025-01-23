import { z } from "zod";

export const formSchema = z.object({
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

export type FICFormSchema = z.infer<typeof formSchema>;