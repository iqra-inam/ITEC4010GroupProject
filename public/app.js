// ---------------- CUSTOMER SIGNUP ----------------
document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (data.success) {
            setTimeout(() => {
                window.location.href = "logincustomer.html";
            }, 500);
        } else {
            document.getElementById("signupForm").reset();
        }

    } catch (err) {
        console.error(err);
        message.textContent = "Server error. Please try again later.";
    }
});

// ---------------- CUSTOMER LOGIN ----------------
// CUSTOMER LOGIN
async function loginUser(e) {
    e.preventDefault(); // Prevent page reload

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    // Clear previous messages
    message.textContent = "";

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // ✅ Login successful → redirect
            window.location.href = "customerdashboard.html";
        } else {
            // Show error inline
            message.textContent = data.message || "Incorrect email or password";
        }
    } catch (err) {
        console.error(err);
        message.textContent = "Server error. Please try again later.";
    }
}

// ---------------- EMPLOYEE LOGIN ----------------
function login() {
  const employeeId = document.getElementById("employeeId").value;
  const password = document.getElementById("employeePassword").value;
  const message = document.getElementById("employeeMessage");

  fetch("http://localhost:3000/employee-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "businessoverview.html";
      } else {
        message.textContent = data.message;
      }
    })
    .catch(err => {
      console.error(err);
      message.textContent = "Server error. Please try again.";
    });
}

