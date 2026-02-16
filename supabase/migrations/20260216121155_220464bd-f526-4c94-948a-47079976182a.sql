
-- Update accept_barber_term to also activate the barber after accepting the term
CREATE OR REPLACE FUNCTION public.accept_barber_term(
  p_token uuid,
  p_term_id uuid,
  p_content_snapshot text,
  p_commission_rate numeric,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_barber_id UUID;
BEGIN
  SELECT id INTO v_barber_id FROM barbers WHERE term_token = p_token;
  IF v_barber_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO term_acceptances (barber_id, term_id, user_id, content_snapshot, commission_rate_snapshot, ip_address, user_agent)
  VALUES (v_barber_id, p_term_id, '00000000-0000-0000-0000-000000000000', p_content_snapshot, p_commission_rate, p_ip, p_user_agent);

  -- Clear token and activate the barber
  UPDATE barbers SET term_token = NULL, is_active = true WHERE id = v_barber_id;
  RETURN TRUE;
END;
$$;
