// ==========================================================
// BUSINESS LOGIN
// ==========================================================
async function login() {
    const employee_id = document.getElementById("employeeId")?.value.trim();
    const password = document.getElementById("employeePassword")?.value.trim();
    const msg = document.getElementById("employeeMessage");

    if (!employee_id || !password) return;

    msg.textContent = "";

    const res = await fetch("http://localhost:3000/employee-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id, password })
    });

    const data = await res.json();

    if (!data.success) {
        msg.textContent = data.message || "Login failed.";
        return;
    }

    localStorage.setItem("employeeId", data.employeeId);
    localStorage.setItem("employeeName", data.name);

    window.location.href = "businessoverview.html";
}

// ==========================================================
// CUSTOMER LOGIN
// ==========================================================
async function loginUser(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();
    const msg = document.getElementById("loginMessage");

    msg.textContent = "";

    const res = await fetch("http://localhost:3000/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.success) {
        msg.textContent = data.message || "Login failed.";
        return;
    }

    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);

    window.location.href = "customerdashboard.html";
}

// ==========================================================
// DOMContentLoaded: signup + customer login + business list
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

    // ---------------- CUSTOMER SIGNUP ----------------
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const msg = document.getElementById("message");

            msg.textContent = "";

            if (password !== confirmPassword) {
                msg.textContent = "Passwords do not match!";
                return;
            }

            const res = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!data.success) {
                msg.textContent = data.message;
                return;
            }

            msg.style.color = "green";
            msg.textContent = "Signup successful! Redirecting...";

            setTimeout(() => {
                window.location.href = "logincustomer.html";
            }, 1500);
        });
    }

    // ---------------- CUSTOMER LOGIN PAGE ----------------
    const customerLoginForm = document.getElementById("loginForm");
    if (customerLoginForm) {
        customerLoginForm.addEventListener("submit", loginUser);
    }

    // ---------------- CUSTOMER DASHBOARD: LOAD BUSINESSES ----------------
    const businessContainer = document.getElementById("businessContainer");
    const filterDropdown = document.getElementById("filterDropdown");

    if (businessContainer) {
        let allBusinesses = [];

        function renderBusinesses(list) {
            businessContainer.innerHTML = "";

            if (!list || list.length === 0) {
                businessContainer.innerHTML = "<p>No businesses available.</p>";
                return;
            }

            list.forEach(biz => {
                const card = document.createElement("div");
                card.className = "business-row-card";

                card.innerHTML = `
                    <div class="business-row-main">
                        <div class="business-row-text">
                            <h3>${biz.name}</h3>
                            <p><strong>Location:</strong> ${biz.location}</p>
                            <p><strong>Category:</strong> ${biz.category || "N/A"}</p>
                            <p><strong>Working Days:</strong> ${biz.working_days || "N/A"}</p>
                            <p><strong>Approx. Wait Time:</strong> ${biz.waiting_time || 0} minutes</p>
                            <p><strong>People in Queue:</strong> ${biz.queue_length || 0}</p>
                        </div>
                        <div class="business-row-actions">
                            <button class="btn"
                                onclick="window.location.href='businessdetails.html?id=${biz.id}'">
                                View
                            </button>
                        </div>
                    </div>
                `;

                businessContainer.appendChild(card);
            });
        }

        async function loadBusinesses() {
            try {
                const res = await fetch("http://localhost:3000/businesses");
                const data = await res.json();

                if (!data.success) {
                    businessContainer.innerHTML = "<p>Failed to load businesses.</p>";
                    return;
                }

                allBusinesses = data.businesses || [];
                applyFilter();
            } catch (err) {
                console.error("Error loading businesses:", err);
                businessContainer.innerHTML = "<p>Error loading businesses.</p>";
            }
        }

        function applyFilter() {
            const value = filterDropdown ? filterDropdown.value : "";
            if (!value) {
                renderBusinesses(allBusinesses);
            } else {
                const filtered = allBusinesses.filter(b => (b.category || "").toLowerCase() === value.toLowerCase());
                renderBusinesses(filtered);
            }
        }

        if (filterDropdown) {
            filterDropdown.addEventListener("change", applyFilter);
        }

        loadBusinesses();
    }
});