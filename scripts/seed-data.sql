-- Seed data for RoofQuote Canada application

-- Insert Canadian provincial pricing data
INSERT INTO pricing_zones (province, province_name, base_rate_low, base_rate_high, complexity_multiplier_max) VALUES
('ON', 'Ontario', 8.00, 12.00, 1.6),
('BC', 'British Columbia', 9.00, 14.00, 1.7),
('AB', 'Alberta', 7.00, 11.00, 1.5),
('QC', 'Quebec', 8.00, 13.00, 1.6),
('MB', 'Manitoba', 7.00, 10.00, 1.4),
('SK', 'Saskatchewan', 7.00, 11.00, 1.5),
('NS', 'Nova Scotia', 8.00, 12.00, 1.6),
('NB', 'New Brunswick', 7.00, 11.00, 1.5),
('PE', 'Prince Edward Island', 8.00, 12.00, 1.6),
('NL', 'Newfoundland and Labrador', 8.00, 13.00, 1.6);

-- Insert sample roofing contractors
INSERT INTO roofing_contractors (
    business_name, contact_email, contact_phone, service_areas, specialties, 
    license_number, insurance_verified, rating, review_count, verified, active
) VALUES
('Superior Roofing Solutions', 'info@superiorroofing.ca', '416-555-0101', 
 ARRAY['Toronto', 'Mississauga', 'Brampton', 'Oakville'], 
 ARRAY['Residential', 'Commercial', 'Emergency Repairs', 'Insurance Claims'], 
 'ON-ROOF-12345', TRUE, 4.8, 127, TRUE, TRUE),

('Elite Roof Masters', 'contact@eliteroofmasters.ca', '416-555-0102',
 ARRAY['Toronto', 'Vaughan', 'Richmond Hill', 'Markham'],
 ARRAY['Premium Materials', 'Warranty Coverage', 'Slate Roofing'],
 'ON-ROOF-23456', TRUE, 4.9, 89, TRUE, TRUE),

('Canadian Roofing Experts', 'hello@canroofexperts.ca', '905-555-0103',
 ARRAY['GTA', 'Durham Region', 'York Region'],
 ARRAY['Insurance Claims', 'Storm Damage', 'Metal Roofing'],
 'ON-ROOF-34567', TRUE, 4.7, 156, TRUE, TRUE),

('Pacific Coast Roofing', 'info@pacificcoastroofing.ca', '604-555-0201',
 ARRAY['Vancouver', 'Burnaby', 'Surrey', 'Richmond'],
 ARRAY['Cedar Shakes', 'Tile Roofing', 'Green Roofs'],
 'BC-ROOF-45678', TRUE, 4.6, 203, TRUE, TRUE),

('Mountain View Roofing', 'contact@mountainviewroofing.ca', '403-555-0301',
 ARRAY['Calgary', 'Edmonton', 'Red Deer'],
 ARRAY['Metal Roofing', 'Snow Load Specialists', 'Commercial'],
 'AB-ROOF-56789', TRUE, 4.8, 94, TRUE, TRUE),

('Quebec Toiture Excellence', 'info@toitureexcellence.ca', '514-555-0401',
 ARRAY['Montreal', 'Quebec City', 'Laval', 'Longueuil'],
 ARRAY['Membrane Roofing', 'Slate Installation', 'Heritage Restoration'],
 'QC-ROOF-67890', TRUE, 4.5, 178, TRUE, TRUE);

-- Insert sample properties (for testing)
INSERT INTO properties (address, latitude, longitude, province, city, postal_code, roof_data) VALUES
('123 Main Street, Toronto, ON M5V 3A8', 43.6532, -79.3832, 'ON', 'Toronto', 'M5V3A8',
 '{"roofArea": 2400, "usableArea": 2100, "segments": 4, "pitchComplexity": "moderate", "buildingHeight": 25}'),

('456 Oak Avenue, Vancouver, BC V6B 1A1', 49.2827, -123.1207, 'BC', 'Vancouver', 'V6B1A1',
 '{"roofArea": 2800, "usableArea": 2500, "segments": 6, "pitchComplexity": "complex", "buildingHeight": 30}'),

('789 Elm Drive, Calgary, AB T2P 1J9', 51.0447, -114.0719, 'AB', 'Calgary', 'T2P1J9',
 '{"roofArea": 3200, "usableArea": 2900, "segments": 3, "pitchComplexity": "simple", "buildingHeight": 22}');

-- Insert sample users
INSERT INTO users (email, phone, first_name, last_name) VALUES
('john.smith@email.com', '416-555-1234', 'John', 'Smith'),
('sarah.johnson@email.com', '604-555-5678', 'Sarah', 'Johnson'),
('mike.brown@email.com', '403-555-9012', 'Mike', 'Brown');

-- Insert sample lead submissions
INSERT INTO lead_submissions (property_id, user_id, user_answers, price_estimate, status) VALUES
(1, 1, 
 '{"roofConditions": ["Multiple roof levels"], "roofAge": "15-25", "roofMaterial": "asphalt", "propertyAccess": "easy", "serviceType": ["Complete roof replacement"], "timeline": "soon", "contactPreference": "phone", "contactTime": "evening"}',
 '{"lowEstimate": 16800, "highEstimate": 25200, "province": "ON", "complexityScore": 1.3}',
 'pending'),

(2, 2,
 '{"roofConditions": ["Trees casting shadows", "Skylights"], "roofAge": "5-15", "roofMaterial": "cedar", "propertyAccess": "narrow", "serviceType": ["Roof repair", "Gutter work"], "timeline": "planning", "contactPreference": "email", "contactTime": "morning"}',
 '{"lowEstimate": 22500, "highEstimate": 35000, "province": "BC", "complexityScore": 1.5}',
 'sent');

-- Insert sample contractor leads
INSERT INTO contractor_leads (lead_id, contractor_id, status, lead_cost) VALUES
(1, 1, 'sent', 25.00),
(1, 2, 'sent', 25.00),
(1, 3, 'contacted', 25.00),
(2, 4, 'quoted', 30.00);
