const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ================= CUSTOMER SIGNUP =================
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if email already exists
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.json({ success: false, message: "Database error" });
      }

      if (results.length > 0) {
        return res.json({ success: false, message: "Email already has an account..." });
      }

      // ✅ HASH PASSWORD HERE
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (insertErr) => {
          if (insertErr) {
            console.error(insertErr);
            return res.json({ success: false, message: "Could not create account" });
          }

          res.json({ success: true, message: "Signup successful!" });
        }
      );
    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
});

// ================= CUSTOMER LOGIN =================
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.json({ success: false, message: "Server error" });

    if (results.length === 0) {
      return res.json({ success: false, message: "No account found" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true });
  });
});

// ================= EMPLOYEE LOGIN =================
// ================= EMPLOYEE LOGIN =================
app.post('/employee-login', (req, res) => {
  const { employeeId, password } = req.body;

  db.query(
    "SELECT * FROM employees WHERE employee_id = ?",
    [employeeId],
    (err, results) => {
      if (err) return res.json({ success: false, message: "Server error" });

      if (results.length === 0) {
        return res.json({ success: false, message: "No employee found" });
      }

      const employee = results[0];

      // Compare plain password directly
      if (password !== employee.password) {
        return res.json({ success: false, message: "Incorrect password" });
      }

      return res.json({ success: true, message: "Login successful" });
    }
  );
});
