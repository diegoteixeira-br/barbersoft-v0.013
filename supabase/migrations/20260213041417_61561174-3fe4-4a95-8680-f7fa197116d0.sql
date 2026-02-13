UPDATE public.influencer_term_templates 
SET content = replace(
  content, 
  '5.3. Utilizar exclusivamente o link fornecido para rastreamento dos leads.', 
  E'5.3. Utilizar exclusivamente o link fornecido para rastreamento dos leads.\n5.4. Seu link exclusivo de indicação: {LINK_INDICACAO}'
),
updated_at = now()
WHERE id = '3af390a6-d388-4f88-b0f6-4e83d318f228';