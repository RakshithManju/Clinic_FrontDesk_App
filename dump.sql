-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: new_clinic
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint unsigned NOT NULL DEFAULT '1',
  `patient_id` bigint unsigned NOT NULL,
  `doctor_id` bigint unsigned NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration_minutes` int unsigned DEFAULT '30',
  `status` enum('scheduled','confirmed','in_progress','completed','cancelled','no_show') DEFAULT 'scheduled',
  `appointment_type` varchar(100) DEFAULT 'consultation',
  `notes` text,
  `chief_complaint` text,
  `consultation_fee` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','paid','partially_paid','refunded') DEFAULT 'pending',
  `reminder_sent` tinyint(1) DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinic_id` (`clinic_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_appointment_date` (`appointment_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,1,1,'2024-01-15','09:00:00',30,'cancelled','consultation','Regular checkup completed','Annual physical examination',150.00,'paid',0,NULL,'2025-08-09 19:28:20','2025-08-10 08:19:00'),(2,1,2,3,'2024-01-15','10:30:00',45,'completed','consultation','Diabetes follow-up','Blood sugar monitoring',200.00,'paid',0,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(3,1,3,2,'2024-01-16','14:00:00',60,'scheduled','consultation','Cardiology consultation','Chest pain evaluation',300.00,'pending',0,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(4,1,4,5,'2024-01-16','15:30:00',30,'confirmed','consultation','Skin examination','Mole check',180.00,'pending',0,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(5,1,5,4,'2024-01-17','08:00:00',45,'scheduled','consultation','Orthopedic evaluation','Knee pain',250.00,'pending',0,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(6,1,6,7,'2025-08-15','10:30:00',30,'scheduled','Consultation',NULL,NULL,NULL,'pending',0,NULL,'2025-08-10 07:23:39','2025-08-10 07:23:39');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinics`
--

DROP TABLE IF EXISTS `clinics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text,
  `phone` varchar(32) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT 'UTC',
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinics`
--

LOCK TABLES `clinics` WRITE;
/*!40000 ALTER TABLE `clinics` DISABLE KEYS */;
INSERT INTO `clinics` VALUES (1,'MediCare Plus Clinic','123 Healthcare Ave, Medical District, City 12345','+1-555-0123','info@medicareplus.com','America/New_York',NULL,'2025-08-09 19:27:47','2025-08-09 19:27:47');
/*!40000 ALTER TABLE `clinics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `head_doctor_id` bigint unsigned DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinic_id` (`clinic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,'General Medicine','Primary healthcare and general consultations',NULL,'Ground Floor, Wing A','+1-555-0124',1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(2,1,'Cardiology','Heart and cardiovascular care',NULL,'First Floor, Wing B','+1-555-0125',1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(3,1,'Pediatrics','Child healthcare and development',NULL,'Ground Floor, Wing C','+1-555-0126',1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(4,1,'Orthopedics','Bone and joint care',NULL,'Second Floor, Wing A','+1-555-0127',1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(5,1,'Dermatology','Skin and hair care',NULL,'First Floor, Wing C','+1-555-0128',1,'2025-08-09 19:28:20','2025-08-09 19:28:20');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_schedules`
--

DROP TABLE IF EXISTS `doctor_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_schedules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint unsigned NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `max_patients` int unsigned DEFAULT '20',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_day_of_week` (`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_schedules`
--

LOCK TABLES `doctor_schedules` WRITE;
/*!40000 ALTER TABLE `doctor_schedules` DISABLE KEYS */;
INSERT INTO `doctor_schedules` VALUES (1,1,'monday','09:00:00','17:00:00',1,25,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(2,1,'tuesday','09:00:00','17:00:00',1,25,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(3,1,'wednesday','09:00:00','17:00:00',1,25,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(4,1,'thursday','09:00:00','17:00:00',1,25,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(5,1,'friday','09:00:00','15:00:00',1,20,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(6,2,'monday','08:00:00','16:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(7,2,'tuesday','08:00:00','16:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(8,2,'wednesday','08:00:00','16:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(9,2,'thursday','08:00:00','16:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(10,2,'friday','08:00:00','14:00:00',1,12,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(11,3,'monday','10:00:00','18:00:00',1,30,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(12,3,'tuesday','10:00:00','18:00:00',1,30,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(13,3,'wednesday','10:00:00','18:00:00',1,30,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(14,3,'thursday','10:00:00','18:00:00',1,30,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(15,3,'friday','10:00:00','16:00:00',1,25,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(16,3,'saturday','09:00:00','13:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(17,4,'monday','07:00:00','15:00:00',1,20,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(18,4,'tuesday','07:00:00','15:00:00',1,20,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(19,4,'wednesday','07:00:00','15:00:00',1,20,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(20,4,'thursday','07:00:00','15:00:00',1,20,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(21,4,'friday','07:00:00','13:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(22,5,'monday','11:00:00','19:00:00',1,18,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(23,5,'tuesday','11:00:00','19:00:00',1,18,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(24,5,'wednesday','11:00:00','19:00:00',1,18,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(25,5,'thursday','11:00:00','19:00:00',1,18,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(26,5,'friday','11:00:00','17:00:00',1,15,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20');
/*!40000 ALTER TABLE `doctor_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint unsigned NOT NULL DEFAULT '1',
  `department_id` bigint unsigned DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `sub_specialization` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `experience_years` int unsigned DEFAULT NULL,
  `education` text,
  `location` varchar(100) NOT NULL,
  `consultation_fee` decimal(10,2) DEFAULT NULL,
  `profile` json DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinic_id` (`clinic_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_specialization` (`specialization`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,1,1,'DOC001','Dr. Sarah Johnson','General Medicine','Family Medicine','female','1980-05-15','+1-555-1001','sarah.johnson@medicareplus.com','MD123456',12,'MD from Harvard Medical School, Residency at Johns Hopkins','Room 101',150.00,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(2,1,2,'DOC002','Dr. Michael Chen','Cardiology','Interventional Cardiology','male','1975-08-22','+1-555-1002','michael.chen@medicareplus.com','MD234567',18,'MD from Stanford University, Fellowship in Cardiology at Mayo Clinic','Room 201',300.00,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(3,1,3,'DOC003','Dr. Emily Rodriguez','Pediatrics','Developmental Pediatrics','female','1985-03-10','+1-555-1003','emily.rodriguez@medicareplus.com','MD345678',8,'MD from UCLA, Pediatric Residency at Children\'s Hospital LA','Room 102',200.00,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(4,1,4,'DOC004','Dr. James Wilson','Orthopedics','Sports Medicine','male','1978-11-30','+1-555-1004','james.wilson@medicareplus.com','MD456789',15,'MD from University of Michigan, Orthopedic Surgery Residency at Cleveland Clinic','Room 301',250.00,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(5,1,5,'DOC005','Dr. Lisa Thompson','Dermatology','Cosmetic Dermatology','female','1982-07-18','+1-555-1005','lisa.thompson@medicareplus.com','MD567890',10,'MD from NYU School of Medicine, Dermatology Residency at Mount Sinai','Room 202',180.00,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(6,1,NULL,NULL,'dr','General Medicine','kjjfhd','male',NULL,'asdadasd','asda2@gmail.com','1237',21,'','blr',2222.00,NULL,NULL,1,'2025-08-10 07:21:05','2025-08-10 07:21:05'),(7,1,NULL,NULL,'Dr. John Doe','General Medicine',NULL,'male',NULL,'555-1234','john.doe@test.com','MD12345',NULL,NULL,'Main Clinic',NULL,NULL,NULL,1,'2025-08-10 07:23:06','2025-08-10 07:23:06');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint unsigned NOT NULL DEFAULT '1',
  `patient_id` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(32) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `allergies` text,
  `medical_history` text,
  `insurance_info` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  KEY `idx_clinic_id` (`clinic_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_name` (`first_name`,`last_name`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,1,'P001','John','Smith','1985-03-15','male','+1-555-2001','john.smith@email.com','123 Main St, City, State 12345','Jane Smith','+1-555-2002','O+','None','Hypertension, managed with medication',NULL,NULL,NULL,0,'2025-08-09 19:28:20','2025-08-09 22:01:54'),(2,1,'P002','Mary','Johnson','1990-07-22','female','+1-555-2003','mary.johnson@email.com','456 Oak Ave, City, State 12345','Robert Johnson','+1-555-2004','A+','Penicillin','Diabetes Type 2, diet controlled',NULL,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(3,1,'P003','David','Williams','1978-11-08','male','+1-555-2005','david.williams@email.com','789 Pine Rd, City, State 12345','Sarah Williams','+1-555-2006','B+','Shellfish','Asthma, uses inhaler',NULL,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(4,1,'P004','Jennifer','Brown','1992-04-12','female','+1-555-2007','jennifer.brown@email.com','321 Elm St, City, State 12345','Michael Brown','+1-555-2008','AB+','None','No significant medical history',NULL,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(5,1,'P005','Robert','Davis','1965-09-30','male','+1-555-2009','robert.davis@email.com','654 Maple Dr, City, State 12345','Linda Davis','+1-555-2010','O-','Latex','Heart disease, on medication',NULL,NULL,NULL,1,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(6,1,NULL,'Jane','Smith',NULL,'female','555-5678','jane.smith@test.com','123 Main St',NULL,NULL,'A+',NULL,NULL,NULL,NULL,NULL,1,'2025-08-10 07:23:28','2025-08-10 07:23:28');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `queue_entries`
--

DROP TABLE IF EXISTS `queue_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `queue_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint unsigned NOT NULL DEFAULT '1',
  `patient_id` bigint unsigned NOT NULL,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `queue_number` int unsigned NOT NULL,
  `priority_level` enum('low','normal','high','urgent') DEFAULT 'normal',
  `status` enum('waiting','in_progress','completed','cancelled') DEFAULT 'waiting',
  `estimated_wait_time` int unsigned DEFAULT NULL,
  `check_in_time` datetime NOT NULL,
  `called_time` datetime DEFAULT NULL,
  `service_start_time` datetime DEFAULT NULL,
  `service_end_time` datetime DEFAULT NULL,
  `notes` text,
  `appointment_id` bigint unsigned DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinic_id` (`clinic_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_queue_number` (`queue_number`),
  KEY `idx_status` (`status`),
  KEY `idx_priority_level` (`priority_level`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `queue_entries`
--

LOCK TABLES `queue_entries` WRITE;
/*!40000 ALTER TABLE `queue_entries` DISABLE KEYS */;
INSERT INTO `queue_entries` VALUES (1,1,1,1,1,'normal','waiting',15,'2024-01-15 08:45:00',NULL,NULL,NULL,'Regular appointment',NULL,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(2,1,2,1,2,'normal','waiting',30,'2024-01-15 08:50:00',NULL,NULL,NULL,'Follow-up visit',NULL,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(3,1,3,2,1,'high','waiting',10,'2024-01-15 08:55:00',NULL,NULL,NULL,'Chest pain - priority',NULL,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(4,1,4,3,1,'normal','waiting',20,'2024-01-15 09:00:00',NULL,NULL,NULL,'Pediatric checkup',NULL,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(5,1,5,4,1,'normal','waiting',25,'2024-01-15 09:05:00',NULL,NULL,NULL,'Orthopedic consultation',NULL,NULL,'2025-08-09 19:28:20','2025-08-09 19:28:20'),(6,1,6,7,3,'normal','waiting',15,'2025-08-10 12:58:22',NULL,NULL,NULL,'Patient waiting for checkup',6,NULL,'2025-08-10 07:28:22','2025-08-10 07:28:22');
/*!40000 ALTER TABLE `queue_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint unsigned NOT NULL DEFAULT '1',
  `email` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `roles` json DEFAULT NULL,
  `role` varchar(100) DEFAULT 'frontdesk',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_clinic_id` (`clinic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'frontdesk@medicareplus.com','frontdesk','$2b$10$rQZ8kHWfQxwjKqZvQxwjKe','$2a$10$eT910w0tUgg1lCMwXSYNIuOccv5ACGmd6/l5o.KDO/mwWsHI6QvUm','Front','Desk','[\"FRONT_DESK\"]','FRONT_DESK',1,NULL,'2025-08-09 19:28:20','2025-08-09 21:44:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-10 22:00:20