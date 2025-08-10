-- Seed minimal demo data
INSERT INTO clinics (id, name, timezone) VALUES (1, 'Demo Clinic', 'UTC') ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (clinic_id, email, username, password_hash, roles, is_active)
VALUES
(1, 'frontdesk@clinic.com', 'frontdesk', '$2y$10$PLACEHOLDER_BCRYPT', JSON_ARRAY('FRONT_DESK'), 1)
ON DUPLICATE KEY UPDATE username=VALUES(username);

INSERT INTO doctors (clinic_id, name, specialization, gender, location, is_active)
VALUES
(1, 'Dr. Alice Park', 'General Medicine', 'female', 'Main Clinic', 1),
(1, 'Dr. Ben Carter', 'Pediatrics', 'male', 'Annex A', 1),
(1, 'Dr. Chen Li', 'Dermatology', 'female', 'Telehealth', 1);

-- Basic weekly schedules (Mon-Fri)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_len_minutes, is_active)
VALUES
(1, 1, '09:00', '17:00', 30, 1),
(1, 2, '09:00', '17:00', 30, 1),
(1, 3, '09:00', '17:00', 30, 1),
(1, 4, '09:00', '17:00', 30, 1),
(1, 5, '09:00', '15:00', 30, 1),

(2, 1, '10:00', '18:00', 30, 1),
(2, 3, '10:00', '18:00', 30, 1),
(2, 5, '10:00', '16:00', 30, 1),

(3, 2, '08:00', '12:00', 30, 1),
(3, 4, '13:00', '17:00', 30, 1);

-- Demo patient
INSERT INTO patients (clinic_id, first_name, last_name, phone, email)
VALUES (1, 'Jane', 'Doe', '+15550001', 'jane@example.com');
