const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3000;

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
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.json({ success: false, message: "Database error" });

      if (results.length > 0) {
        return res.json({ success: false, message: "Email already has an account" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (insertErr) => {
          if (insertErr) {
            return res.json({ success: false, message: "Could not create account" });
          }
          res.json({ success: true, message: "Signup successful!" });
        }
      );
    });
  } catch (error) {
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
    res.json({ success: true, message: "Login successful", userId: user.id});
  });
});

// ================= EMPLOYEE LOGIN (NO HASH) =================
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

      if (password !== employee.password) {
        return res.json({ success: false, message: "Incorrect password" });
      }

      res.json({ success: true, message: "Employee login successful" });
    }
  );
});

// ================= GET BUSINESSES =================
app.get('/businesses', (req, res) => {
  db.query("SELECT * FROM businesses", (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, businesses: [] });
    }
    res.json({ success: true, businesses: results });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// POST /join-queue
app.post('/join-queue', (req, res) => {
    const { userId, businessId } = req.body;

    if (!userId || !businessId) {
        return res.json({ success: false, message: "Missing userId or businessId" });
    }

    // Check if user is already in a queue
    db.query("SELECT * FROM queue WHERE user_id = ?", [userId], (err, results) => {
        if (err) return res.json({ success: false, message: "Database error" });

        if (results.length > 0) {
            const existingTicket = results[0].ticket_number;
            return res.json({
                success: false,
                message: "You are already in a queue",
                ticketNumber: existingTicket,
                businessId: results[0].business_id
            });
        }

        // Generate ticket number
        const ticketNumber = `A${Math.floor(Math.random() * 99 + 1)}`;

        db.query(
            "INSERT INTO queue (user_id, business_id, ticket_number) VALUES (?, ?, ?)",
            [userId, businessId, ticketNumber],
            (err2) => {
                if (err2) return res.json({ success: false, message: "Could not join queue" });

                res.json({
                    success: true,
                    ticketNumber
                });
            }
        );
    });
});

// GET /user-queue/:userId
app.get('/user-queue/:userId', (req, res) => {
    const userId = req.params.userId;

    db.query("SELECT * FROM queue WHERE user_id = ?", [userId], (err, results) => {
        if (err) return res.json({ success: false, queue: null });
        res.json({ success: true, queue: results[0] || null });
    });
});
