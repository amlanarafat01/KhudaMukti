
--   psql -U postgres -d khudamukti_db -f db/seed-member3.sql
-- Existing demo donor DONOR001 and listings 5, 7, 8, 9 (qty 50, AVAILABLE) are already in the database.
-- Passwords here are placeholders; real accounts come from POST /auth/register (Member 1).
INSERT INTO users (id, name, age, email, address, "isBangladeshi", gender, password, role, "isVerified") VALUES
  ('ADMIN001',     'Demo Admin',               35, 'admin@example.com',     'Gulshan, Dhaka',   true, 'Male',   'local-test-password', 'admin',     true),
  ('RECEIVER001',  'Hope Orphanage',           40, 'receiver@example.com',  'Mirpur, Dhaka',    true, 'Female', 'local-test-password', 'receiver',  true),
  ('RECEIVER002',  'Unverified Shelter',       30, 'receiver2@example.com', 'Uttara, Dhaka',    true, 'Male',   'local-test-password', 'receiver',  false),
  ('RECEIVER003',  'Second Verified Receiver', 33, 'receiver3@example.com', 'Banani, Dhaka',    true, 'Male',   'local-test-password', 'receiver',  true),
  ('VOLUNTEER001', 'Demo Volunteer',           22, 'volunteer@example.com', 'Mohakhali, Dhaka', true, 'Male',   'local-test-password', 'volunteer', true)
ON CONFLICT (id) DO NOTHING;
