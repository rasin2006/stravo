INSERT INTO users (name, email, password_hash) VALUES ('Test User', 'test@example.com', 'password-hash');
INSERT INTO segments (name, start_location, end_location, distance_meters, difficulty, scenic_score) VALUES
('River Trail', 'SRID=4326;POINT(-77.0369 38.9072)', 'SRID=4326;POINT(-77.0434 38.9093)', 1500, 'easy', 4.5),
('Farm Loop', 'SRID=4326;POINT(-77.0500 38.9050)', 'SRID=4326;POINT(-77.0550 38.9020)', 2200, 'moderate', 4.0);
