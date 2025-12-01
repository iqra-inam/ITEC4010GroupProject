const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));


// ---------------- CUSTOMER SIGNUP ----------------
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, rows) => {
        if (err) {
            console.log("SIGNUP ERROR:", err);
            return res.json({ success: false, message: "DB error" });
        }

        if (rows.length > 0) {
            return res.json({ success: false, message: "Email already registered" });
        }

        db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, password],
            (err2) => {
                if (err2) {
                    console.log("SIGNUP INSERT ERROR:", err2);
                    return res.json({ success: false, message: "DB error" });
                }

                return res.json({ success: true });
            }
        );
    });
});


// ---------------- CUSTOMER LOGIN ----------------
app.post("/customer-login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=? AND password=?",
        [email, password],
        (err, result) => {
            if (err) {
                console.log("CUSTOMER LOGIN ERROR:", err);
                return res.json({ success: false, message: "DB error" });
            }

            if (result.length === 0)
                return res.json({ success: false, message: "Invalid login" });

            return res.json({
                success: true,
                userId: result[0].id,
                username: result[0].username
            });
        }
    );
});


// ---------------- BUSINESS LOGIN ----------------
app.post("/employee-login", (req, res) => {
    const { employee_id, password } = req.body;

    db.query(
        "SELECT * FROM employees WHERE employee_id=? AND password=?",
        [employee_id, password],
        (err, result) => {
            if (err) {
                console.log("EMPLOYEE LOGIN ERROR:", err);
                return res.json({ success: false, message: "DB error" });
            }

            if (result.length === 0)
                return res.json({ success: false, message: "Invalid ID or password." });

            return res.json({
                success: true,
                employeeId: result[0].id,
                name: result[0].full_name
            });
        }
    );
});


// ---------------- GET ALL BUSINESSES ----------------
app.get("/businesses", (req, res) => {
    db.query("SELECT * FROM businesses", (err, rows) => {
        if (err) {
            console.log("BUSINESSES FETCH ERROR:", err);
            return res.json({ success: false });
        }

        return res.json({ success: true, businesses: rows });
    });
});


// ---------------- ADD BUSINESS ----------------
app.post("/businesses", (req, res) => {
    const {
        name,
        location,
        working_days,
        waiting_time,
        queue_length,
        category,
        description
    } = req.body;

    db.query(
        `INSERT INTO businesses 
         (name, location, working_days, waiting_time, queue_length, category, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, location, working_days, waiting_time, queue_length, category, description],
        (err) => {
            if (err) {
                console.log("ADD BUSINESS ERROR:", err);
                return res.json({ success: false, message: "DB error" });
            }

            return res.json({ success: true });
        }
    );
});


// ---------------- JOIN QUEUE ----------------
app.post("/join-queue", (req, res) => {
    const { userId, businessId } = req.body;

    db.query("SELECT * FROM queue WHERE user_id=?", [userId], (err, rows) => {
        if (err) {
            console.log("JOIN QUEUE ERROR:", err);
            return res.json({ success: false, message: "DB error" });
        }

        if (rows.length > 0) {
            return res.json({ success: false, message: "Already in a queue" });
        }

        db.query("SELECT queue_length FROM businesses WHERE id=?", [businessId], (err2, business) => {
            if (err2) {
                console.log("QUEUE LENGTH FETCH ERROR:", err2);
                return res.json({ success: false, message: "DB error" });
            }

            if (business.length === 0) {
                return res.json({ success: false, message: "Business not found" });
            }

            const ticket = business[0].queue_length + 1;

            db.query(
                "INSERT INTO queue (user_id, business_id, ticket_number) VALUES (?, ?, ?)",
                [userId, businessId, ticket]
            );

            db.query(
                "UPDATE businesses SET queue_length = queue_length + 1 WHERE id=?",
                [businessId]
            );

            return res.json({ success: true, ticketNumber: ticket });
        });
    });
});


// ---------------- GET USER QUEUE ----------------
app.get("/user-queue/:userId", (req, res) => {
    const userId = req.params.userId;

    db.query(
        `SELECT q.*, b.name AS business_name
         FROM queue q
         JOIN businesses b ON q.business_id = b.id
         WHERE q.user_id = ?`,
        [userId],
        (err, rows) => {
            if (err) {
                console.log("FETCH USER QUEUE ERROR:", err);
                return res.json({ success: false, message: "DB error" });
            }

            if (rows.length === 0) {
                return res.json({ success: false, message: "Not in queue" });
            }

            return res.json({ success: true, queue: rows[0] });
        }
    );
});


// ---------------- LEAVE QUEUE ----------------
app.post("/leave-queue", (req, res) => {
    const { userId } = req.body;

    db.query("SELECT * FROM queue WHERE user_id=?", [userId], (err, rows) => {
        if (err) {
            console.log("LEAVE QUEUE ERROR:", err);
            return res.json({ success: false, message: "DB error" });
        }

        if (rows.length === 0)
            return res.json({ success: false, message: "Not in queue" });

        const businessId = rows[0].business_id;

        db.query("DELETE FROM queue WHERE user_id=?", [userId]);
        db.query("UPDATE businesses SET queue_length = queue_length - 1 WHERE id=?", [businessId]);

        return res.json({ success: true });
    });
});


// ---------------- BUSINESS QUEUE FOR MANAGEMENT PAGE ----------------
app.get("/business-queue/:businessId", (req, res) => {
    const businessId = req.params.businessId;

    const sql = `
        SELECT 
            q.id,
            q.user_id,
            u.username,
            q.ticket_number,
            q.joined_at
        FROM queue q
        JOIN users u ON q.user_id = u.id
        WHERE q.business_id = ?
        ORDER BY q.ticket_number ASC
    `;

    db.query(sql, [businessId], (err, rows) => {
        if (err) {
            console.log("BUSINESS QUEUE ERROR:", err);
            return res.json({ success: false, message: "DB error" });
        }

        return res.json({
            success: true,
            queue: rows
        });
    });
});


// ---------------- CLEAR ALL QUEUE ENTRIES FOR A BUSINESS ----------------
app.post("/clear-business-queue", (req, res) => {
    const { businessId } = req.body;

    if (!businessId) {
        return res.json({ success: false, message: "No businessId provided" });
    }

    db.query("DELETE FROM queue WHERE business_id = ?", [businessId], (err) => {
        if (err) {
            console.log("CLEAR BUSINESS QUEUE ERROR:", err);
            return res.json({ success: false, message: "DB error" });
        }

        db.query(
            "UPDATE businesses SET queue_length = 0 WHERE id = ?",
            [businessId],
            (err2) => {
                if (err2) {
                    console.log("RESET QUEUE_LENGTH ERROR:", err2);
                    return res.json({ success: false, message: "DB error" });
                }

                return res.json({ success: true });
            }
        );
    });
});

// ---------------- DELETE BUSINESS ----------------
app.post("/delete-business", (req, res) => {
    const { businessId } = req.body;

    if (!businessId) {
        return res.json({ success: false, message: "No businessId provided" });
    }

    db.query("DELETE FROM queue WHERE business_id = ?", [businessId], (err) => {
        if (err) {
            console.log("DELETE BUSINESS QUEUE ERROR:", err);
            return res.json({ success: false, message: "DB error clearing queue" });
        }

        db.query("DELETE FROM businesses WHERE id = ?", [businessId], (err2, result) => {
            if (err2) {
                console.log("DELETE BUSINESS ERROR:", err2);
                return res.json({ success: false, message: "DB error deleting business" });
            }

            if (result.affectedRows === 0) {
                return res.json({ success: false, message: "Business not found" });
            }

            return res.json({ success: true });
        });
    });
});

// ---------------- START SERVER ----------------
app.listen(3000, () => {
    console.log("Server running on port 3000");
    console.log("➡ Open: http://localhost:3000/mainlogin.html");
});