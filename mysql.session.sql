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
('EMP003', 'Mark Adam', 'Admin', '11111');

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
