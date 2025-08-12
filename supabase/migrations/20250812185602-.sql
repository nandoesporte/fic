-- Harden functions: set fixed search_path and avoid unnecessary SECURITY DEFINER

-- 1) update_updated_at_column: ensure invoker and fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 2) refresh_materialized_views: fix search_path and invoker
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vote_analytics;
END;
$$;

-- 3) update_vote_tracking_on_delete: fix search_path and invoker
CREATE OR REPLACE FUNCTION public.update_vote_tracking_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $$
BEGIN
  UPDATE vote_tracking
  SET vote_count = vote_count - 1
  WHERE email = OLD.email
    AND questionnaire_id = OLD.questionnaire_id
    AND section_type = OLD.option_type;
  RETURN OLD;
END;
$$;

-- 4) validate_vote: fix search_path and invoker
CREATE OR REPLACE FUNCTION public.validate_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Get or create vote tracking record
  INSERT INTO vote_tracking (email, questionnaire_id, section_type, vote_count)
  VALUES (NEW.email, NEW.questionnaire_id, NEW.option_type, 1)
  ON CONFLICT (email, questionnaire_id, section_type)
  DO UPDATE SET vote_count = vote_tracking.vote_count + 1
  RETURNING vote_count INTO current_count;

  -- Validate vote count
  IF current_count > 3 THEN
    RAISE EXCEPTION 'Limite de 3 votos por seção excedido';
  END IF;

  RETURN NEW;
END;
$$;

-- 5) safe_delete_dimension: remove SECURITY DEFINER (use invoker) and fix search_path
CREATE OR REPLACE FUNCTION public.safe_delete_dimension(dimension_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $$
DECLARE
  dimension_identifier text;
  questionnaire_count integer;
BEGIN
  -- Get the dimension identifier
  SELECT identifier INTO dimension_identifier
  FROM fic_dimensions
  WHERE id = dimension_id;

  -- Count related questionnaires
  SELECT COUNT(*) INTO questionnaire_count
  FROM fic_questionnaires
  WHERE dimension = dimension_identifier;

  -- If there are related questionnaires, raise an informative error
  IF questionnaire_count > 0 THEN
    RAISE EXCEPTION 'Não é possível excluir a dimensão pois existem % questionário(s) associado(s).', questionnaire_count;
  END IF;

  -- Delete the dimension if no questionnaires are found
  DELETE FROM fic_dimensions WHERE id = dimension_id;
  RETURN true;
END;
$$;

-- 6) clean_questionnaire_votes: keep SECURITY DEFINER (admin routine) but ensure search_path is fixed (already set); re-create to standardize format
CREATE OR REPLACE FUNCTION public.clean_questionnaire_votes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_count INTEGER;
  v_active_questionnaires UUID[];
  v_active_dimensions TEXT[];
BEGIN
  -- Lock tables to prevent concurrent modifications
  LOCK TABLE questionnaire_votes IN EXCLUSIVE MODE;
  LOCK TABLE dimension_votes IN EXCLUSIVE MODE;
  LOCK TABLE fic_questionnaires IN EXCLUSIVE MODE;

  -- Get active questionnaire IDs and their dimensions
  SELECT 
    ARRAY_AGG(id),
    ARRAY_AGG(DISTINCT dimension)
  INTO 
    v_active_questionnaires,
    v_active_dimensions
  FROM fic_questionnaires
  WHERE status = 'active';
  
  -- Get count for validation
  SELECT COUNT(*) INTO v_count
  FROM fic_questionnaires
  WHERE status = 'active';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'No active questionnaires found to clean';
  END IF;

  -- Delete votes with explicit WHERE clause
  DELETE FROM questionnaire_votes
  WHERE questionnaire_id = ANY(v_active_questionnaires);
  
  -- Delete only dimension votes for active dimensions
  DELETE FROM dimension_votes
  WHERE dimension = ANY(v_active_dimensions);
  
  -- Delete active questionnaires with explicit WHERE clause
  DELETE FROM fic_questionnaires 
  WHERE id = ANY(v_active_questionnaires);

  -- Update remaining questionnaires with explicit WHERE clause
  UPDATE fic_questionnaires 
  SET status = 'completed' 
  WHERE status = 'pending';

  -- Raise notice with operation summary
  RAISE NOTICE 'Cleanup completed successfully. Deleted % questionnaires', v_count;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error cleaning questionnaire votes: %', SQLERRM;
END;
$$;