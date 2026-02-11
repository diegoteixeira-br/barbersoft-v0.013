INSERT INTO public.plan_features (feature_key, feature_name, feature_type, inicial_value, profissional_value, franquias_value, display_order) VALUES
('units', 'Unidades', 'limit', '1', '1', 'Ilimitadas', 1),
('barbers', 'Profissionais', 'limit', 'Até 5', 'Até 10', 'Ilimitados', 2),
('agenda', 'Agenda completa', 'boolean', 'true', 'true', 'true', 3),
('financial_dashboard', 'Dashboard financeiro', 'boolean', 'true', 'true', 'true', 4),
('client_management', 'Gestão de clientes', 'boolean', 'true', 'true', 'true', 5),
('service_control', 'Controle de serviços', 'boolean', 'true', 'true', 'true', 6),
('whatsapp_integration', 'Integração WhatsApp', 'boolean', 'false', 'true', 'true', 7),
('jackson_ai', 'Jackson IA (Atendente Virtual)', 'boolean', 'false', 'true', 'true', 8),
('marketing_automations', 'Marketing e automações', 'boolean', 'false', 'true', 'true', 9),
('auto_commissions', 'Comissões automáticas', 'boolean', 'false', 'true', 'true', 10),
('inventory_control', 'Controle de estoque', 'boolean', 'false', 'true', 'true', 11),
('advanced_reports', 'Relatórios avançados', 'boolean', 'false', 'true', 'true', 12),
('consolidated_dashboard', 'Dashboard consolidado de todas unidades', 'boolean', 'false', 'false', 'true', 13)
ON CONFLICT DO NOTHING;