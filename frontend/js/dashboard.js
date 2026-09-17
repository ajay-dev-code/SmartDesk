const API_BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");
const userData = localStorage.getItem("user");


// Check authentication
if (!token) {
    window.location.href = "login.html";
}


// Display admin name
if (userData) {
    const user = JSON.parse(userData);

    document.getElementById("adminName").textContent = user.name;
}


// Get dashboard data
async function loadDashboard() {

    const message = document.getElementById("dashboardMessage");

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/tickets/dashboard`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");

                window.location.href = "login.html";
                return;
            }

            throw new Error(data.detail || "Failed to load dashboard.");
        }


        // Display real ticket counts

        document.getElementById("totalTickets").textContent =
            data.total_tickets;

        document.getElementById("openTickets").textContent =
            data.open_tickets;

        document.getElementById("inProgressTickets").textContent =
            data.in_progress_tickets;

        document.getElementById("resolvedTickets").textContent =
            data.resolved_tickets;

        document.getElementById("closedTickets").textContent =
            data.closed_tickets;


    } catch (error) {

        console.error("Dashboard error:", error);

        message.textContent = error.message;
        message.style.color = "#dc2626";
    }
}


// Logout
document.getElementById("logoutButton").addEventListener(
    "click",
    function () {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "login.html";
    }
);


// Load dashboard
loadDashboard();