-- Atualizar todos os status das opções para 'active' para permitir votação
UPDATE fic_questionnaires 
SET 
  strengths_statuses = ARRAY['active'::text, 'active'::text, 'active'::text],
  challenges_statuses = ARRAY['active'::text, 'active'::text, 'active'::text],
  opportunities_statuses = ARRAY['active'::text, 'active'::text, 'active'::text]
WHERE status = 'active';