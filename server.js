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
    res.json({ success: true, message: "Login successful", userId: user.id });
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

// ================= BUSINESSES =================

// GET all businesses (used by overview, queues, details pages)
app.get('/businesses', (req, res) => {
  db.query("SELECT * FROM businesses", (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, businesses: [] });
    }
    res.json({ success: true, businesses: results });
  });
});

// POST create a new business / queue (used by Businessaddqueue.html)
app.post('/businesses', (req, res) => {
  const { name, type, date, location, access, capacity } = req.body;

  if (!name || !location) {
    return res.json({ success: false, message: "Name and location are required" });
  }

  const working_days = date || null;
  const waiting_time = 0;
  const queue_length = 0;
  const category = type || null;

  const descParts = [];
  if (access) descParts.push(`Access: ${access}`);
  if (capacity) descParts.push(`Capacity: ${capacity}`);
  if (date) descParts.push(`Date: ${date}`);

  const description = descParts.length ? descParts.join(', ') : null;

  const sql = `
    INSERT INTO businesses
    (name, location, working_days, waiting_time, queue_length, category, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, location, working_days, waiting_time, queue_length, category, description],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ success: false, message: "Could not create business/queue" });
      }
      res.json({
        success: true,
        message: "Queue / business created",
        id: result.insertId
      });
    }
  );
});

// ================= QUEUES (FOR BUSINESS DASHBOARD + CUSTOMER) =================

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

    // How many people are already in this business' queue
    db.query(
      "SELECT COUNT(*) AS count FROM queue WHERE business_id = ?",
      [businessId],
      (err2, countResults) => {
        if (err2) return res.json({ success: false, message: "Database error" });

        const position = countResults[0].count + 1;
        const ticketNumber = `A${String(position).padStart(2, '0')}`;

        db.query(
          "INSERT INTO queue (user_id, business_id, ticket_number) VALUES (?, ?, ?)",
          [userId, businessId, ticketNumber],
          (err3) => {
            if (err3) return res.json({ success: false, message: "Could not join queue" });

            // Update businesses.queue_length
            db.query(
              "UPDATE businesses SET queue_length = IFNULL(queue_length, 0) + 1 WHERE id = ?",
              [businessId],
              (err4) => {
                if (err4) {
                  console.error("Error updating queue_length", err4);
                }
                return res.json({
                  success: true,
                  ticketNumber
                });
              }
            );
          }
        );
      }
    );
  });
});

// GET /user-queue/:userId  (customer dashboard)
app.get('/user-queue/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query("SELECT * FROM queue WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.json({ success: false, queue: null });
    res.json({ success: true, queue: results[0] || null });
  });
});

// GET all queue entries for a business (used by businessManage.html)
app.get('/business-queue/:businessId', (req, res) => {
  const businessId = req.params.businessId;

  db.query(
    "SELECT * FROM queue WHERE business_id = ? ORDER BY joined_at ASC",
    [businessId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.json({ success: false, queue: [] });
      }
      res.json({ success: true, queue: results });
    }
  );
});

// POST leave queue (optional, if you hook a Leave button later)
app.post('/leave-queue', (req, res) => {
  const { userId, businessId } = req.body;

  if (!userId || !businessId) {
    return res.json({ success: false, message: "Missing userId or businessId" });
  }

  db.query(
    "DELETE FROM queue WHERE user_id = ? AND business_id = ?",
    [userId, businessId],
    (err, result) => {
      if (err) return res.json({ success: false, message: "Database error" });

      if (result.affectedRows > 0) {
        db.query(
          "UPDATE businesses SET queue_length = GREATEST(IFNULL(queue_length, 0) - 1, 0) WHERE id = ?",
          [businessId],
          (err2) => {
            if (err2) console.error("Error updating queue length on leave", err2);
            return res.json({ success: true });
          }
        );
      } else {
        // nothing deleted but do not treat as error
        return res.json({ success: true });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
