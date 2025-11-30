// ---------------- CUSTOMER SIGNUP ----------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
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
                signupForm.reset();
            }
        } catch (err) {
            console.error(err);
            message.textContent = "Server error. Please try again later.";
        }
    });
}

// ---------------- CUSTOMER LOGIN ----------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");
        message.textContent = "";

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = "customerdashboard.html";
                localStorage.setItem("userId", data.userId);
            } else {
                message.textContent = data.message || "Incorrect email or password";
            }
        } catch (err) {
            console.error(err);
            message.textContent = "Server error. Please try again later.";
        }
    });
}

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userId");
    localStorage.clear();
    window.location.href = "logincustomer.html";
  });
}

// ---------------- EMPLOYEE LOGIN ----------------
const employeeForm = document.getElementById("employeeLoginForm");
if (employeeForm) {
    employeeForm.addEventListener("submit", function(e) {
        e.preventDefault();

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
    });
}

// ---------------- FETCH AND DISPLAY BUSINESSES ----------------
async function loadBusinesses(filter = "") {
    const container = document.getElementById("businessContainer");
    if (!container) return;

    container.textContent = "Loading businesses...";

    try {
        const response = await fetch("http://localhost:3000/businesses");
        const data = await response.json();

        const businesses = data.businesses; // ✅ CORRECT DATA SOURCE

        container.innerHTML = "";

        if (!businesses || businesses.length === 0) {
            container.textContent = "No businesses found.";
            return;
        }

        businesses
            .filter(b => filter === "" || b.category === filter)
            .forEach(biz => {
                const card = document.createElement("div");
                card.className = "business-card";

                card.innerHTML = `
                    <div class="card-content">
                        <div class="card-info">
                            <h3>${biz.name}</h3>
                            <p><strong>Location:</strong> ${biz.location}</p>
                            <p><strong>Working Days:</strong> ${biz.working_days}</p>
                            <p><strong>Waiting Time:</strong> ${biz.waiting_time} mins</p>
                            <p><strong>Queue Length:</strong> ${biz.queue_length}</p>
                            <p><strong>Category:</strong> ${biz.category}</p>
                        </div>
                        <div class="card-action">
                            <button class="view-btn" data-id="${biz.id}">View</button>
                        </div>
                    </div>
                `;

                container.appendChild(card);

                card.querySelector(".view-btn").addEventListener("click", () => {
                    window.location.href = `businessdetails.html?id=${biz.id}`;
                });
            });

    } catch (err) {
        console.error(err);
        container.textContent = "Server error. Could not load businesses.";
    }
}

// ---------------- FILTER DROPDOWN ----------------
const filterDropdown = document.getElementById("filterDropdown");
if (filterDropdown) {
    filterDropdown.addEventListener("change", () => {
        loadBusinesses(filterDropdown.value);
    });
}

// ---------------- AUTO LOAD ON PAGE OPEN ----------------
window.addEventListener("DOMContentLoaded", () => {
    loadBusinesses(); 
});
