CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

SELECT * FROM users;

DELETE FROM users;

SELECT email, password FROM users;

DROP TABLE employees;

DROP TABLE employee;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO employees (employee_id, full_name, role, password) VALUES
('EMP001', 'Sarah John', 'Receptionist', '$2a$10$yD1GmT5dQVXzFY5RcHMT6eW8qkq3K9LLV8YsXMd6q9ApXqBq8QWyq'),
('EMP002', 'Michael Brown', 'Manager', '$2a$10$6Eo8uJvD8p0UyWhSKd7T3u7uTjQ5q9qBfK9WJpZ9Q0ILX0D1pZ9Cu'),
('EMP003', 'Mark Adam', 'Admin', '$2a$10$A0oJZC2RsjMg9oY7YqO94OjJ9zq9BzYx8DkS7U2dk5gf5c8ep.LVy');

DELECT FROM employees; 

SHOW TABLES;

SELECT * FROM employees;

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO employees (employee_id, full_name, role, password) VALUES
('EMP001', 'Sarah John', 'Receptionist', '12345'),
('EMP002', 'Michael Brown', 'Manager', '09876'),
('EMP003', 'Mark Adam', 'Admin', '11111'),
('mustafa', 'mustafa Salman', 'test','mustafa123');


SHOW TABLES;

SELECT * FROM employees;

CREATE TABLE businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  working_days VARCHAR(50),
  waiting_time INT,
  queue_length INT,
  category VARCHAR(50)
);

INSERT INTO businesses (name, location, working_days, waiting_time, queue_length, category) VALUES
('Downtown Clinic', 'Toronto', 'Mon-Fri', 15, 8, 'clinics'),
('North York Office', 'North York', 'Weekends', 25, 14, 'offices'),
('Mississauga Service Centre', 'Mississauga', 'Mon-Sat', 10, 4, 'services');

SELECT * FROM businesses;

ALTER TABLE businesses
ADD COLUMN description TEXT;

UPDATE businesses
SET description = 'Downtown Clinic is a full-service medical facility specializing in pediatric and family care. Our team of certified doctors and nurses ensures that patients of all ages receive compassionate, high-quality medical attention. We offer flexible appointment scheduling, walk-in options, and a child-friendly environment to make visits as comfortable as possible.'
WHERE id = 1;

UPDATE businesses
SET description = 'North York Office provides professional office space and consultation services for legal, financial, and business needs. Equipped with modern facilities, private meeting rooms, and experienced staff, clients can conduct confidential meetings, receive expert advice, and access administrative support in a professional and welcoming setting.'
WHERE id = 2;

UPDATE businesses
SET description = 'Mississauga Service Centre is your go-to hub for a wide variety of customer services, including document processing, technical support, and community assistance programs. Our trained staff are committed to providing efficient, reliable, and friendly service to ensure your tasks are completed quickly and correctly. Convenient parking and extended hours make it easy to visit any day of the week.'
WHERE id = 3;

CREATE TABLE IF NOT EXISTS queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    user_id INT NOT NULL,
    ticket_number VARCHAR(10) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_queue (user_id)  -- prevents same user joining multiple queues
);

CREATE TABLE IF NOT EXISTS queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_id INT NOT NULL,
    ticket_number VARCHAR(10) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_queue (user_id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM notifications;

DELETE FROM notifications;

DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SHOW TABLES;


SELECT * FROM users;