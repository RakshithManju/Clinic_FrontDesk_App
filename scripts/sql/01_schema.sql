-- MySQL schema for Front Desk System
-- Charset & engine
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS clinics (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
clinic_id BIGINT UNSIGNED NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
username VARCHAR(100),
password_hash VARCHAR(255) NOT NULL,
roles JSON NOT NULL,
is_active TINYINT(1) NOT NULL DEFAULT 1,
last_login_at DATETIME NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_users_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctors (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
clinic_id BIGINT UNSIGNED NOT NULL,
name VARCHAR(255) NOT NULL,
specialization VARCHAR(100) NOT NULL,
gender ENUM('male','female','other') NOT NULL,
location VARCHAR(100) NOT NULL,
profile JSON NULL,
is_active TINYINT(1) NOT NULL DEFAULT 1,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_doctors_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
INDEX idx_doctors_specialization (specialization),
INDEX idx_doctors_location (location)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patients (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
clinic_id BIGINT UNSIGNED NOT NULL,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
phone VARCHAR(32),
email VARCHAR(255),
metadata JSON NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_patients_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
INDEX idx_patients_name (last_name, first_name),
INDEX idx_patients_email (email)
) ENGINE=InnoDB;

-- Weekly schedule templates per doctor (day_of_week 0-6)
CREATE TABLE IF NOT EXISTS doctor_schedules (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
doctor_id BIGINT UNSIGNED NOT NULL,
day_of_week TINYINT UNSIGNED NOT NULL,
start_time TIME NOT NULL,
end_time TIME NOT NULL,
slot_len_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
is_active TINYINT(1) NOT NULL DEFAULT 1,
CONSTRAINT fk_schedules_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
UNIQUE KEY uq_schedule (doctor_id, day_of_week, start_time, end_time)
) ENGINE=InnoDB;

-- Specific day exceptions (BLOCK or EXTRA)
CREATE TABLE IF NOT EXISTS schedule_exceptions (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
doctor_id BIGINT UNSIGNED NOT NULL,
date DATE NOT NULL,
start_time TIME NOT NULL,
end_time TIME NOT NULL,
type ENUM('BLOCK','EXTRA') NOT NULL,
CONSTRAINT fk_sched_ex_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
INDEX idx_sched_ex_date (doctor_id, date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
clinic_id BIGINT UNSIGNED NOT NULL,
patient_id BIGINT UNSIGNED NOT NULL,
doctor_id BIGINT UNSIGNED NOT NULL,
start_time DATETIME NOT NULL,
end_time DATETIME NOT NULL,
status ENUM('BOOKED','RESCHEDULED','CANCELLED','COMPLETED','NO_SHOW') NOT NULL DEFAULT 'BOOKED',
source VARCHAR(50) DEFAULT 'FRONT_DESK',
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
INDEX idx_appt_patient_start (patient_id, start_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS queue_entries (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
clinic_id BIGINT UNSIGNED NOT NULL,
patient_id BIGINT UNSIGNED NOT NULL,
queue_number INT UNSIGNED NOT NULL,
status ENUM('WAITING','WITH_DOCTOR','COMPLETED','NO_SHOW','CANCELED') NOT NULL DEFAULT 'WAITING',
priority ENUM('NORMAL','URGENT') NOT NULL DEFAULT 'NORMAL',
assigned_doctor_id BIGINT UNSIGNED NULL,
arrival_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
arrival_date DATE GENERATED ALWAYS AS (DATE(arrival_time)) STORED,
called_time DATETIME NULL,
completed_time DATETIME NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_queue_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id),
CONSTRAINT fk_queue_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
CONSTRAINT fk_queue_doctor FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id),
UNIQUE KEY uq_queue_number_day (clinic_id, queue_number, arrival_date),
INDEX idx_queue_status (clinic_id, status, priority, arrival_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
clinic_id BIGINT UNSIGNED NOT NULL,
actor_user_id BIGINT UNSIGNED,
entity_type VARCHAR(64) NOT NULL,
entity_id VARCHAR(64) NOT NULL,
action VARCHAR(64) NOT NULL,
before_json JSON NULL,
after_json JSON NULL,
ip VARCHAR(64),
user_agent VARCHAR(255),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
INDEX idx_audit_time (created_at),
INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB;

-- Refresh token store for rotation/revocation
CREATE TABLE IF NOT EXISTS refresh_tokens (
token_hash CHAR(64) PRIMARY KEY,
user_id BIGINT UNSIGNED NOT NULL,
device_id VARCHAR(100),
issued_at DATETIME NOT NULL,
expires_at DATETIME NOT NULL,
revoked TINYINT(1) NOT NULL DEFAULT 0,
last_used_at DATETIME NULL,
INDEX idx_rt_user (user_id, revoked, expires_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
