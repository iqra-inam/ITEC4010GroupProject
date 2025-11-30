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

// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

// POST /join-queue
app.post('/join-queue', (req, res) => {
    const { userId, businessId, ticketNumber } = req.body;

    if (!userId || !businessId || !ticketNumber) {
        return res.json({ success: false, message: "Missing userId, businessId, or ticketNumber" });
    }

    db.query(
        "SELECT * FROM queue WHERE user_id = ? AND business_id = ?",
        [userId, businessId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Database error" });

            if (results.length > 0)
                return res.json({ success: false, message: "You are already in this queue" });

            db.query(
                "INSERT INTO queue (user_id, business_id, ticket_number) VALUES (?, ?, ?)",
                [userId, businessId, ticketNumber],
                (err2) => {
                    if (err2) return res.json({ success: false, message: "Could not join queue" });

                    res.json({ success: true, ticketNumber });
                }
            );
        }
    );
});

// get queue info
app.post('/get-queue-info', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: "User not found." });
  }

  // Join queue with businesses to get the business name
  const query = `
  SELECT q.ticket_number, q.business_id, b.name AS business_name
  FROM queue q
  JOIN businesses b ON q.business_id = b.id
  WHERE q.user_id = ?
`;


  db.query(query, [userId], (err, results) => {
    if (err) return res.json({ success: false, message: "Database error" });

    res.json({ success: true, results });
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



// ================= NOTIFICATION ROUTES =================
app.get('/notifications/:userId', (req, res) => {
    const userId = req.params.userId;

    db.query(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "DB error" });

            const formatted = results.map(n => ({
                id: n.id,
                message: n.message,
                type: n.type,
                read: !!n.is_read,
                created_at: n.created_at
            }));

            res.json(formatted);
        }
    );
});

app.post('/notifications/mark-read', (req, res) => {
    const { userId, notificationId } = req.body;

    db.query(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        [notificationId, userId],
        (err) => {
            if (err) return res.json({ success: false });
            res.json({ success: true });
        }
    );
});

// ================= STATIC MUST BE LAST =================
app.use(express.static('public'));

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
