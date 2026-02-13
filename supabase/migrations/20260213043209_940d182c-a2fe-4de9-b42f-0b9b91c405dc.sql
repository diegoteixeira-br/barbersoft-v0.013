
CREATE OR REPLACE FUNCTION public.recalculate_all_client_fidelity()
RETURNS TABLE(processed_clients integer, updated_clients integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client RECORD;
  v_unit RECORD;
  v_processed INT := 0;
  v_updated INT := 0;
  v_loyalty_cuts INT;
  v_total_visits INT;
  v_earned_courtesies INT;
  v_current_cuts INT;
  v_last_visit TIMESTAMPTZ;
  v_appt RECORD;
BEGIN
  -- Only process clients belonging to units owned by the current user
  FOR v_client IN 
    SELECT c.id, c.unit_id, c.phone, c.name, c.loyalty_cuts as old_cuts, c.total_visits as old_visits
    FROM public.clients c
    JOIN public.units u ON c.unit_id = u.id
    WHERE u.user_id = auth.uid()
  LOOP
    v_processed := v_processed + 1;
    
    SELECT fidelity_program_enabled, fidelity_min_value, fidelity_cuts_threshold
    INTO v_unit
    FROM public.units
    WHERE id = v_client.unit_id;
    
    IF NOT COALESCE(v_unit.fidelity_program_enabled, false) THEN
      CONTINUE;
    END IF;
    
    v_loyalty_cuts := 0;
    v_total_visits := 0;
    v_last_visit := NULL;
    
    FOR v_appt IN
      SELECT total_price, payment_method, start_time
      FROM public.appointments
      WHERE unit_id = v_client.unit_id
        AND status = 'completed'
        AND (client_phone = v_client.phone OR lower(trim(client_name)) = lower(trim(v_client.name)))
    LOOP
      v_total_visits := v_total_visits + 1;
      IF v_last_visit IS NULL OR v_appt.start_time > v_last_visit THEN
        v_last_visit := v_appt.start_time;
      END IF;
      IF v_appt.total_price >= COALESCE(v_unit.fidelity_min_value, 0)
         AND v_appt.payment_method NOT IN ('Cortesia de Fidelidade', 'fidelity_courtesy') THEN
        v_loyalty_cuts := v_loyalty_cuts + 1;
      END IF;
    END LOOP;
    
    v_earned_courtesies := v_loyalty_cuts / COALESCE(v_unit.fidelity_cuts_threshold, 10);
    v_current_cuts := v_loyalty_cuts % COALESCE(v_unit.fidelity_cuts_threshold, 10);
    
    UPDATE public.clients
    SET loyalty_cuts = v_current_cuts,
        total_visits = v_total_visits,
        total_courtesies_earned = v_earned_courtesies,
        last_visit_at = v_last_visit,
        updated_at = now()
    WHERE id = v_client.id;
    
    v_updated := v_updated + 1;
  END LOOP;
  
  RETURN QUERY SELECT v_processed, v_updated;
END;
$$;
