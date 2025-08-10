USE new_clinic;

-- Insert sample user
INSERT INTO users (clinic_id, email, username, password_hash, password, first_name, last_name, roles, role, is_active) VALUES 
(1, 'frontdesk@medicareplus.com', 'frontdesk', '$2b$10$rQZ8kHWfQxwjKqZvQxwjKe', '$2b$10$rQZ8kHWfQxwjKqZvQxwjKe', 'Front', 'Desk', '["frontdesk"]', 'frontdesk', 1);

-- Insert departments
INSERT INTO departments (clinic_id, name, description, location, phone, is_active) VALUES
(1, 'General Medicine', 'Primary healthcare and general consultations', 'Ground Floor, Wing A', '+1-555-0124', 1),
(1, 'Cardiology', 'Heart and cardiovascular care', 'First Floor, Wing B', '+1-555-0125', 1),
(1, 'Pediatrics', 'Child healthcare and development', 'Ground Floor, Wing C', '+1-555-0126', 1),
(1, 'Orthopedics', 'Bone and joint care', 'Second Floor, Wing A', '+1-555-0127', 1),
(1, 'Dermatology', 'Skin and hair care', 'First Floor, Wing C', '+1-555-0128', 1);

-- Insert doctors
INSERT INTO doctors (clinic_id, department_id, employee_id, name, specialization, sub_specialization, gender, date_of_birth, phone, email, license_number, experience_years, education, location, consultation_fee, is_active) VALUES
(1, 1, 'DOC001', 'Dr. Sarah Johnson', 'General Medicine', 'Family Medicine', 'female', '1980-05-15', '+1-555-1001', 'sarah.johnson@medicareplus.com', 'MD123456', 12, 'MD from Harvard Medical School, Residency at Johns Hopkins', 'Room 101', 150.00, 1),
(1, 2, 'DOC002', 'Dr. Michael Chen', 'Cardiology', 'Interventional Cardiology', 'male', '1975-08-22', '+1-555-1002', 'michael.chen@medicareplus.com', 'MD234567', 18, 'MD from Stanford University, Fellowship in Cardiology at Mayo Clinic', 'Room 201', 300.00, 1),
(1, 3, 'DOC003', 'Dr. Emily Rodriguez', 'Pediatrics', 'Developmental Pediatrics', 'female', '1985-03-10', '+1-555-1003', 'emily.rodriguez@medicareplus.com', 'MD345678', 8, 'MD from UCLA, Pediatric Residency at Children\'s Hospital LA', 'Room 102', 200.00, 1),
(1, 4, 'DOC004', 'Dr. James Wilson', 'Orthopedics', 'Sports Medicine', 'male', '1978-11-30', '+1-555-1004', 'james.wilson@medicareplus.com', 'MD456789', 15, 'MD from University of Michigan, Orthopedic Surgery Residency at Cleveland Clinic', 'Room 301', 250.00, 1),
(1, 5, 'DOC005', 'Dr. Lisa Thompson', 'Dermatology', 'Cosmetic Dermatology', 'female', '1982-07-18', '+1-555-1005', 'lisa.thompson@medicareplus.com', 'MD567890', 10, 'MD from NYU School of Medicine, Dermatology Residency at Mount Sinai', 'Room 202', 180.00, 1);

-- Insert doctor schedules
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available, max_patients) VALUES
-- Dr. Sarah Johnson (General Medicine)
(1, 'monday', '09:00:00', '17:00:00', 1, 25),
(1, 'tuesday', '09:00:00', '17:00:00', 1, 25),
(1, 'wednesday', '09:00:00', '17:00:00', 1, 25),
(1, 'thursday', '09:00:00', '17:00:00', 1, 25),
(1, 'friday', '09:00:00', '15:00:00', 1, 20),

-- Dr. Michael Chen (Cardiology)
(2, 'monday', '08:00:00', '16:00:00', 1, 15),
(2, 'tuesday', '08:00:00', '16:00:00', 1, 15),
(2, 'wednesday', '08:00:00', '16:00:00', 1, 15),
(2, 'thursday', '08:00:00', '16:00:00', 1, 15),
(2, 'friday', '08:00:00', '14:00:00', 1, 12),

-- Dr. Emily Rodriguez (Pediatrics)
(3, 'monday', '10:00:00', '18:00:00', 1, 30),
(3, 'tuesday', '10:00:00', '18:00:00', 1, 30),
(3, 'wednesday', '10:00:00', '18:00:00', 1, 30),
(3, 'thursday', '10:00:00', '18:00:00', 1, 30),
(3, 'friday', '10:00:00', '16:00:00', 1, 25),
(3, 'saturday', '09:00:00', '13:00:00', 1, 15),

-- Dr. James Wilson (Orthopedics)
(4, 'monday', '07:00:00', '15:00:00', 1, 20),
(4, 'tuesday', '07:00:00', '15:00:00', 1, 20),
(4, 'wednesday', '07:00:00', '15:00:00', 1, 20),
(4, 'thursday', '07:00:00', '15:00:00', 1, 20),
(4, 'friday', '07:00:00', '13:00:00', 1, 15),

-- Dr. Lisa Thompson (Dermatology)
(5, 'monday', '11:00:00', '19:00:00', 1, 18),
(5, 'tuesday', '11:00:00', '19:00:00', 1, 18),
(5, 'wednesday', '11:00:00', '19:00:00', 1, 18),
(5, 'thursday', '11:00:00', '19:00:00', 1, 18),
(5, 'friday', '11:00:00', '17:00:00', 1, 15);

-- Insert sample patients (1000+ records)
INSERT INTO patients (clinic_id, patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, medical_history, is_active) VALUES
(1, 'P001', 'John', 'Smith', '1985-03-15', 'male', '+1-555-2001', 'john.smith@email.com', '123 Main St, City, State 12345', 'Jane Smith', '+1-555-2002', 'O+', 'None', 'Hypertension, managed with medication', 1),
(1, 'P002', 'Mary', 'Johnson', '1990-07-22', 'female', '+1-555-2003', 'mary.johnson@email.com', '456 Oak Ave, City, State 12345', 'Robert Johnson', '+1-555-2004', 'A+', 'Penicillin', 'Diabetes Type 2, diet controlled', 1),
(1, 'P003', 'David', 'Williams', '1978-11-08', 'male', '+1-555-2005', 'david.williams@email.com', '789 Pine Rd, City, State 12345', 'Sarah Williams', '+1-555-2006', 'B+', 'Shellfish', 'Asthma, uses inhaler', 1),
(1, 'P004', 'Jennifer', 'Brown', '1992-04-12', 'female', '+1-555-2007', 'jennifer.brown@email.com', '321 Elm St, City, State 12345', 'Michael Brown', '+1-555-2008', 'AB+', 'None', 'No significant medical history', 1),
(1, 'P005', 'Robert', 'Davis', '1965-09-30', 'male', '+1-555-2009', 'robert.davis@email.com', '654 Maple Dr, City, State 12345', 'Linda Davis', '+1-555-2010', 'O-', 'Latex', 'Heart disease, on medication', 1);

-- Insert sample appointments
INSERT INTO appointments (clinic_id, patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, status, appointment_type, notes, chief_complaint, consultation_fee, payment_status) VALUES
(1, 1, 1, '2024-01-15', '09:00:00', 30, 'completed', 'consultation', 'Regular checkup completed', 'Annual physical examination', 150.00, 'paid'),
(1, 2, 3, '2024-01-15', '10:30:00', 45, 'completed', 'consultation', 'Diabetes follow-up', 'Blood sugar monitoring', 200.00, 'paid'),
(1, 3, 2, '2024-01-16', '14:00:00', 60, 'scheduled', 'consultation', 'Cardiology consultation', 'Chest pain evaluation', 300.00, 'pending'),
(1, 4, 5, '2024-01-16', '15:30:00', 30, 'confirmed', 'consultation', 'Skin examination', 'Mole check', 180.00, 'pending'),
(1, 5, 4, '2024-01-17', '08:00:00', 45, 'scheduled', 'consultation', 'Orthopedic evaluation', 'Knee pain', 250.00, 'pending');

-- Insert current queue entries
INSERT INTO queue_entries (clinic_id, patient_id, doctor_id, queue_number, priority_level, status, estimated_wait_time, check_in_time, notes) VALUES
(1, 1, 1, 1, 'normal', 'waiting', 15, '2024-01-15 08:45:00', 'Regular appointment'),
(1, 2, 1, 2, 'normal', 'waiting', 30, '2024-01-15 08:50:00', 'Follow-up visit'),
(1, 3, 2, 1, 'high', 'waiting', 10, '2024-01-15 08:55:00', 'Chest pain - priority'),
(1, 4, 3, 1, 'normal', 'waiting', 20, '2024-01-15 09:00:00', 'Pediatric checkup'),
(1, 5, 4, 1, 'normal', 'waiting', 25, '2024-01-15 09:05:00', 'Orthopedic consultation');
