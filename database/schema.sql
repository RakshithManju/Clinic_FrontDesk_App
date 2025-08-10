-- Create database
CREATE DATABASE IF NOT EXISTS new_clinic;
USE new_clinic;

-- Create clinics table
CREATE TABLE clinics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(32),
    email VARCHAR(255),
    timezone VARCHAR(64) DEFAULT 'UTC',
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_doctor_id BIGINT UNSIGNED,
    location VARCHAR(255),
    phone VARCHAR(32),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id)
);

-- Create users table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    roles JSON,
    role VARCHAR(100) DEFAULT 'frontdesk',
    is_active TINYINT(1) DEFAULT 1,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_clinic_id (clinic_id)
);

-- Create doctors table
CREATE TABLE doctors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
    department_id BIGINT UNSIGNED,
    employee_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    sub_specialization VARCHAR(100),
    gender ENUM('male', 'female', 'other') NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(32),
    email VARCHAR(255),
    license_number VARCHAR(100),
    experience_years INT UNSIGNED,
    education TEXT,
    location VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10,2),
    profile JSON,
    avatar_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_department_id (department_id),
    INDEX idx_specialization (specialization),
    INDEX idx_is_active (is_active)
);

-- Create doctor_schedules table
CREATE TABLE doctor_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT UNSIGNED NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    max_patients INT UNSIGNED DEFAULT 20,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_day_of_week (day_of_week)
);

-- Create patients table
CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
    patient_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    phone VARCHAR(32),
    email VARCHAR(255),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(32),
    blood_group VARCHAR(10),
    allergies TEXT,
    medical_history TEXT,
    insurance_info JSON,
    metadata JSON,
    avatar_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_name (first_name, last_name),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
);

-- Create appointments table
CREATE TABLE appointments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT UNSIGNED DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    appointment_type VARCHAR(100) DEFAULT 'consultation',
    notes TEXT,
    chief_complaint TEXT,
    consultation_fee DECIMAL(10,2),
    payment_status ENUM('pending', 'paid', 'partially_paid', 'refunded') DEFAULT 'pending',
    reminder_sent TINYINT(1) DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
);

-- Create queue_entries table
CREATE TABLE queue_entries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED,
    queue_number INT UNSIGNED NOT NULL,
    priority_level ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'waiting',
    estimated_wait_time INT UNSIGNED,
    check_in_time DATETIME NOT NULL,
    called_time DATETIME,
    service_start_time DATETIME,
    service_end_time DATETIME,
    notes TEXT,
    appointment_id BIGINT UNSIGNED,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_queue_number (queue_number),
    INDEX idx_status (status),
    INDEX idx_priority_level (priority_level)
);

-- Insert default clinic
INSERT INTO clinics (id, name, address, phone, email, timezone) VALUES 
(1, 'MediCare Plus Clinic', '123 Healthcare Ave, Medical District, City 12345', '+1-555-0123', 'info@medicareplus.com', 'America/New_York');
