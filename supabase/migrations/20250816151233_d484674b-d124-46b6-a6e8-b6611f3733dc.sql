-- Criar tabela para histórico de relatórios IA
CREATE TABLE public.ai_report_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  dimension TEXT NOT NULL,
  backup_id UUID NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_report_history ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_report_history
CREATE POLICY "AI report history is viewable by everyone" 
ON public.ai_report_history 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create AI report history" 
ON public.ai_report_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update AI report history" 
ON public.ai_report_history 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete AI report history" 
ON public.ai_report_history 
FOR DELETE 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_ai_report_history_updated_at
BEFORE UPDATE ON public.ai_report_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();