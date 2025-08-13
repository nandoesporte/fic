-- Remove the existing refresh function that may be creating security definer views
DROP FUNCTION IF EXISTS public.refresh_materialized_views();

-- Create a safer materialized view refresh function without security definer
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Refresh the materialized view without SECURITY DEFINER
  REFRESH MATERIALIZED VIEW CONCURRENTLY vote_analytics;
END;
$function$

-- Ensure the vote_analytics view is properly created as a regular view (not security definer)
DROP VIEW IF EXISTS public.vote_analytics CASCADE;

CREATE VIEW public.vote_analytics AS
SELECT 
  v.questionnaire_id,
  v.option_type,
  v.option_number,
  count(*) AS vote_count,
  q.dimension,
  CASE
    WHEN v.option_type = 'strengths'::vote_type THEN 
      COALESCE(
        NULLIF(TRIM(BOTH FROM split_part(q.strengths, E'\n', v.option_number)), ''), 
        'Opção ' || v.option_number::text
      )
    WHEN v.option_type = 'challenges'::vote_type THEN 
      COALESCE(
        NULLIF(TRIM(BOTH FROM split_part(q.challenges, E'\n', v.option_number)), ''), 
        'Opção ' || v.option_number::text
      )
    WHEN v.option_type = 'opportunities'::vote_type THEN 
      COALESCE(
        NULLIF(TRIM(BOTH FROM split_part(q.opportunities, E'\n', v.option_number)), ''), 
        'Opção ' || v.option_number::text
      )
    ELSE NULL::text
  END AS option_text,
  min(v.created_at) AS created_at
FROM votes v
JOIN fic_questionnaires q ON q.id = v.questionnaire_id
GROUP BY v.questionnaire_id, v.option_type, v.option_number, q.dimension, q.strengths, q.challenges, q.opportunities;