-- New MySQL schema for new_clinic database
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP DATABASE IF EXISTS new_clinic;
CREATE DATABASE new_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE new_clinic;

CREATE TABLE clinics (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(32),
  email VARCHAR(255),
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  roles JSON NOT NULL,
  avatar_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX idx_users_email (email),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE departments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_departments_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id)
) ENGINE=InnoDB;

CREATE TABLE doctors (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED,
  employee_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  sub_specialization VARCHAR(100),
  gender ENUM('male','female','other') NOT NULL,
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
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctors_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_doctors_specialization (specialization),
  INDEX idx_doctors_location (location),
  INDEX idx_doctors_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE patients (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  patient_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male','female','other'),
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
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX idx_patients_name (last_name, first_name),
  INDEX idx_patients_email (email),
  INDEX idx_patients_phone (phone),
  INDEX idx_patients_patient_id (patient_id)
) ENGINE=InnoDB;

CREATE TABLE doctor_schedules (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  doctor_id BIGINT UNSIGNED NOT NULL,
  day_of_week TINYINT UNSIGNED NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  break_start_time TIME,
  break_end_time TIME,
  max_patients_per_slot INT UNSIGNED DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedules_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  UNIQUE KEY uq_schedule (doctor_id, day_of_week, start_time, end_time)
) ENGINE=InnoDB;

CREATE TABLE schedule_exceptions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  doctor_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  type ENUM('BLOCK','EXTRA','HOLIDAY') NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sched_ex_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  INDEX idx_sched_ex_date (doctor_id, date)
) ENGINE=InnoDB;

CREATE TABLE appointments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  appointment_number VARCHAR(50),
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW','RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
  type ENUM('CONSULTATION','FOLLOW_UP','EMERGENCY','ROUTINE_CHECKUP') NOT NULL DEFAULT 'CONSULTATION',
  source ENUM('FRONT_DESK','ONLINE','PHONE','WALK_IN') DEFAULT 'FRONT_DESK',
  notes TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  prescription TEXT,
  fee_charged DECIMAL(10,2),
  payment_status ENUM('PENDING','PAID','PARTIAL','REFUNDED') DEFAULT 'PENDING',
  created_by BIGINT UNSIGNED,
  updated_by BIGINT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  rescheduled_from_appointment_id BIGINT UNSIGNED NULL,
  CONSTRAINT fk_appt_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_appt_resched FOREIGN KEY (rescheduled_from_appointment_id) REFERENCES appointments(id),
  INDEX idx_appt_doctor_start (doctor_id, start_time),
  INDEX idx_appt_patient_start (patient_id, start_time),
  INDEX idx_appt_status (status),
  INDEX idx_appt_date (DATE(start_time))
) ENGINE=InnoDB;

CREATE TABLE queue_entries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  queue_number INT UNSIGNED NOT NULL,
  token_number VARCHAR(20),
  status ENUM('WAITING','CALLED','WITH_DOCTOR','COMPLETED','NO_SHOW','CANCELLED') NOT NULL DEFAULT 'WAITING',
  priority ENUM('NORMAL','URGENT','EMERGENCY') NOT NULL DEFAULT 'NORMAL',
  assigned_doctor_id BIGINT UNSIGNED NULL,
  department_id BIGINT UNSIGNED NULL,
  arrival_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  arrival_date DATE GENERATED ALWAYS AS (DATE(arrival_time)) STORED,
  called_time DATETIME NULL,
  completed_time DATETIME NULL,
  estimated_wait_time INT UNSIGNED,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_queue_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  CONSTRAINT fk_queue_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_queue_doctor FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_queue_department FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE KEY uq_queue_number_day (clinic_id, queue_number, arrival_date),
  INDEX idx_queue_status (clinic_id, status, priority, arrival_time)
) ENGINE=InnoDB;

CREATE TABLE medical_records (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  appointment_id BIGINT UNSIGNED,
  visit_date DATETIME NOT NULL,
  chief_complaint TEXT,
  history_of_present_illness TEXT,
  physical_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  medications TEXT,
  follow_up_instructions TEXT,
  attachments JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_records_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_records_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  INDEX idx_records_patient_date (patient_id, visit_date),
  INDEX idx_records_doctor_date (doctor_id, visit_date)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  token_hash CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  device_id VARCHAR(100),
  device_info JSON,
  issued_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  last_used_at DATETIME NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_rt_user (user_id, revoked, expires_at)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  clinic_id BIGINT UNSIGNED NOT NULL,
  actor_user_id BIGINT UNSIGNED,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX idx_audit_time (created_at),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_actor (actor_user_id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
