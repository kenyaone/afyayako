INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at) VALUES
(100, 'sample_sarah_mwangi_001', 'Dr. Sarah Mwangi', 'sample.sarah.001@local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6', 'professional', 0, datetime('now'), datetime('now')),
(101, 'sample_james_kipchoge_002', 'James Kipchoge', 'sample.james.002@local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6', 'professional', 0, datetime('now'), datetime('now')),
(102, 'sample_grace_ochieng_003', 'Dr. Grace Ochieng', 'sample.grace.003@local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6', 'professional', 0, datetime('now'), datetime('now')),
(103, 'sample_peter_okonkwo_004', 'Peter Okonkwo', 'sample.peter.004@local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6', 'professional', 0, datetime('now'), datetime('now')),
(104, 'sample_amara_hassan_005', 'Dr. Amara Hassan', 'sample.amara.005@local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6', 'professional', 0, datetime('now'), datetime('now')),
(105, 'sample_david_musyoka_006', 'David Musyoka', 'sample.david.006@local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6', 'professional', 0, datetime('now'), datetime('now'));

INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at) VALUES
(100, 'KMPDC000001', 'verified', 1500, 8, 'Female', 4.8, 75, 30, 1, 1, 'Nairobi', 'Nairobi County', '254712345678', datetime('now'), datetime('now')),
(101, 'KMPDC000002', 'verified', 2000, 10, 'Male', 4.8, 120, 50, 1, 1, 'Mombasa', 'Mombasa County', '254712345679', datetime('now'), datetime('now')),
(102, 'KMPDC000003', 'verified', 2500, 12, 'Female', 4.9, 150, 60, 1, 1, 'Kisumu', 'Kisumu County', '254712345680', datetime('now'), datetime('now')),
(103, 'KMPDC000004', 'verified', 1800, 7, 'Male', 4.7, 85, 35, 1, 1, 'Nakuru', 'Nakuru County', '254712345681', datetime('now'), datetime('now')),
(104, 'KMPDC000005', 'verified', 1600, 9, 'Female', 4.8, 95, 40, 1, 1, 'Nairobi', 'Nairobi County', '254712345682', datetime('now'), datetime('now')),
(105, 'KMPDC000006', 'verified', 1700, 6, 'Male', 4.7, 70, 28, 1, 1, 'Nairobi', 'Nairobi County', '254712345683', datetime('now'), datetime('now'));

INSERT INTO presences (user_id, is_online, created_at, updated_at) VALUES
(100, 1, datetime('now'), datetime('now')),
(101, 1, datetime('now'), datetime('now')),
(102, 1, datetime('now'), datetime('now')),
(103, 1, datetime('now'), datetime('now')),
(104, 1, datetime('now'), datetime('now')),
(105, 1, datetime('now'), datetime('now'));
