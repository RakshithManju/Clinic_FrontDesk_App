-- Comprehensive seed data for new_clinic database
USE new_clinic;

-- Insert clinic
INSERT INTO clinics (id, name, address, phone, email, timezone, settings) VALUES 
(1, 'MediCare Plus Hospital', '123 Healthcare Avenue, Medical District, City 12345', '+1-555-0100', 'info@medicareplus.com', 'America/New_York', 
 JSON_OBJECT('working_hours', JSON_OBJECT('start', '06:00', 'end', '22:00'), 'emergency_contact', '+1-555-0911'));

-- Insert departments
INSERT INTO departments (clinic_id, name, description, location, is_active) VALUES
(1, 'General Medicine', 'Primary healthcare and general consultations', 'Building A, Floor 1', 1),
(1, 'Pediatrics', 'Child healthcare and development', 'Building A, Floor 2', 1),
(1, 'Cardiology', 'Heart and cardiovascular care', 'Building B, Floor 1', 1),
(1, 'Dermatology', 'Skin, hair, and nail treatments', 'Building A, Floor 3', 1),
(1, 'Orthopedics', 'Bone, joint, and muscle care', 'Building B, Floor 2', 1),
(1, 'Neurology', 'Brain and nervous system care', 'Building B, Floor 3', 1),
(1, 'Gynecology', 'Women\'s health and reproductive care', 'Building C, Floor 1', 1),
(1, 'Emergency', '24/7 emergency medical services', 'Building D, Ground Floor', 1),
(1, 'Radiology', 'Medical imaging and diagnostics', 'Building A, Basement', 1),
(1, 'Laboratory', 'Medical testing and analysis', 'Building A, Basement', 1);

-- Insert users (staff)
INSERT INTO users (clinic_id, email, username, password_hash, first_name, last_name, roles, is_active) VALUES
(1, 'admin@medicareplus.com', 'admin', '$2b$10$3S7bB7Yt6uN3Py9p8t7yYODoWlJzj9WQeZ3y1y2O2mS0F6mF1S5b6', 'System', 'Administrator', JSON_ARRAY('ADMIN'), 1),
(1, 'frontdesk@medicareplus.com', 'frontdesk', '$2b$10$3S7bB7Yt6uN3Py9p8t7yYODoWlJzj9WQeZ3y1y2O2mS0F6mF1S5b6', 'Sarah', 'Johnson', JSON_ARRAY('FRONT_DESK'), 1),
(1, 'nurse@medicareplus.com', 'nurse', '$2b$10$3S7bB7Yt6uN3Py9p8t7yYODoWlJzj9WQeZ3y1y2O2mS0F6mF1S5b6', 'Emily', 'Davis', JSON_ARRAY('NURSE'), 1),
(1, 'manager@medicareplus.com', 'manager', '$2b$10$3S7bB7Yt6uN3Py9p8t7yYODoWlJzj9WQeZ3y1y2O2mS0F6mF1S5b6', 'Michael', 'Brown', JSON_ARRAY('MANAGER'), 1);
