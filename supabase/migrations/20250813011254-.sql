-- Ensure vote validation checks only active options can be voted and attach trigger

-- 1) Replace validate_vote function to also verify option is active in questionnaire
CREATE OR REPLACE FUNCTION public.validate_vote()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  statuses text[];
BEGIN
  -- Get or create vote tracking record and increment
  INSERT INTO vote_tracking (email, questionnaire_id, section_type, vote_count)
  VALUES (NEW.email, NEW.questionnaire_id, NEW.option_type, 1)
  ON CONFLICT (email, questionnaire_id, section_type)
  DO UPDATE SET vote_count = vote_tracking.vote_count + 1
  RETURNING vote_count INTO current_count;

  -- Validate per-section vote count limit
  IF current_count > 3 THEN
    RAISE EXCEPTION 'Limite de 3 votos por seção excedido';
  END IF;

  -- Fetch the statuses array for the corresponding option type
  SELECT CASE NEW.option_type
           WHEN 'strengths' THEN strengths_statuses
           WHEN 'challenges' THEN challenges_statuses
           WHEN 'opportunities' THEN opportunities_statuses
         END
  INTO statuses
  FROM fic_questionnaires
  WHERE id = NEW.questionnaire_id;

  -- Only allow voting for options explicitly marked as 'active'
  IF statuses IS NULL
     OR array_length(statuses, 1) IS NULL
     OR NEW.option_number > array_length(statuses, 1)
     OR statuses[NEW.option_number] IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Opção não disponível para votação';
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Attach trigger to questionnaire_votes to enforce validation on insert
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_validate_vote'
  ) THEN
    -- Drop and recreate to ensure latest function version is used
    DROP TRIGGER trg_validate_vote ON public.questionnaire_votes;
  END IF;

  CREATE TRIGGER trg_validate_vote
  BEFORE INSERT ON public.questionnaire_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_vote();
END $$;