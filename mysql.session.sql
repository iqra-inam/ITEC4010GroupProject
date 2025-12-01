-- =======================================================
-- FULL CLEAN RESET OF DATABASE
-- =======================================================

DROP DATABASE IF EXISTS queue_system;
CREATE DATABASE queue_system;
USE queue_system;

-- =======================================================
-- USERS TABLE
-- =======================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Sample Customers
INSERT INTO users (username, email, password) VALUES
('Zain', 'zain@example.com', 'zain123'),
('Alice', 'alice@example.com', '12345'),
('Bob', 'bob@example.com', 'password');


-- =======================================================
-- EMPLOYEES TABLE
-- Login uses: employee_id + password
-- =======================================================
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Sample Employees (plaintext passwords)
INSERT INTO employees (employee_id, full_name, role, password) VALUES
('EMP001', 'Sarah John', 'Receptionist', '12345'),
('EMP002', 'Michael Brown', 'Manager', '09876'),
('EMP003', 'Mark Adam', 'Admin', '11111'),
('mustafa', 'Mustafa Salman', 'Test', 'mustafa123');


-- =======================================================
-- BUSINESSES TABLE
-- Matches frontend & server.js
-- =======================================================
CREATE TABLE businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    working_days VARCHAR(255),
    waiting_time INT DEFAULT 0,
    queue_length INT DEFAULT 0,
    category VARCHAR(100),
    description TEXT
);

-- Sample Default Businesses
INSERT INTO businesses (name, location, working_days, waiting_time, queue_length, category, description) VALUES
('Downtown Clinic', 'Toronto', 'Mon-Fri', 15, 8, 'clinics',
 'Downtown Clinic is a full-service medical facility specializing in pediatric and family care. Our team of certified doctors and nurses ensures that patients of all ages receive compassionate, high-quality medical attention.'),
('North York Office', 'North York', 'Weekends', 25, 14, 'offices',
 'North York Office provides professional office space and consultation services for legal, financial, and business needs.'),
('Mississauga Service Centre', 'Mississauga', 'Mon-Sat', 10, 4, 'services',
 'Mississauga Service Centre offers document processing, technical support, and community assistance programs.');


-- =======================================================
-- QUEUE TABLE
-- Correct final version (no duplicates)
-- =======================================================
DROP TABLE IF EXISTS queue;

CREATE TABLE queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_id INT NOT NULL,
    ticket_number INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_queue (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);


-- =======================================================
-- NOTIFICATIONS TABLE (Final Version)
-- =======================================================
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

