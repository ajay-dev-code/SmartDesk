const API_BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");
const userData = localStorage.getItem("user");


// =========================
// Authentication
// =========================

if (!token) {
    window.location.href = "login.html";
}


// =========================
// Display Admin
// =========================

if (userData) {

    const user = JSON.parse(userData);

    document.getElementById("adminName").textContent = user.name;
}


// =========================
// Get Ticket ID
// =========================

const urlParams = new URLSearchParams(window.location.search);

const ticketId = urlParams.get("id");

const message = document.getElementById("ticketMessage");


// =========================
// Validate Ticket ID
// =========================

if (!ticketId) {

    message.textContent = "Ticket ID is missing.";
    message.style.color = "#dc2626";

} else {

    loadTicketDetails();

}


// =========================
// Load Ticket Details
// =========================

async function loadTicketDetails() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/tickets/${ticketId}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        // =========================
        // Authentication Error
        // =========================

        if (response.status === 401 || response.status === 403) {

            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            window.location.href = "login.html";

            return;
        }


        // =========================
        // API Error
        // =========================

        if (!response.ok) {

            throw new Error(
                data.detail || "Failed to load ticket."
            );
        }


        // =========================
        // Display Ticket
        // =========================

        document.getElementById("ticketReference").textContent =
            data.reference_number;

        document.getElementById("customerName").textContent =
            data.customer_name;

        document.getElementById("customerEmail").textContent =
            data.customer_email;

        document.getElementById("ticketSubject").textContent =
            data.subject;

        document.getElementById("ticketDescription").textContent =
            data.description;

        document.getElementById("ticketCategory").textContent =
            data.category;

        document.getElementById("ticketPriority").textContent =
            data.priority;

        document.getElementById("aiSummary").textContent =
            data.ai_summary || "No AI summary available.";

        document.getElementById("createdDate").textContent =
            formatDate(data.created_at);


        // =========================
        // Status Badge
        // =========================

        const statusElement =
            document.getElementById("ticketStatus");

        statusElement.innerHTML = `
            <span class="ticket-status status-${data.status
                .toLowerCase()
                .replace(/\s+/g, "-")}">
                ${data.status}
            </span>
        `;


        // =========================
        // Status History
        // =========================

        displayStatusHistory(data.status_history);


    } catch (error) {

        console.error("Ticket detail error:", error);

        message.textContent = error.message;
        message.style.color = "#dc2626";
    }
}


// =========================
// Display Status History
// =========================

function displayStatusHistory(history) {

    const historyContainer =
        document.getElementById("statusHistory");


    historyContainer.innerHTML = "";


    if (!history || history.length === 0) {

        historyContainer.innerHTML = `
            <div class="empty-state">
                No status history available.
            </div>
        `;

        return;
    }


    history.forEach(item => {

        const historyItem =
            document.createElement("div");

        historyItem.className = "history-item";


        historyItem.innerHTML = `

            <div class="history-status">

                <strong>
                    ${item.previous_status || "Created"}
                </strong>

                <span>→</span>

                <strong>
                    ${item.new_status}
                </strong>

            </div>

            <p class="history-remark">
                ${item.remark || "No remark provided."}
            </p>

            <div class="history-date">
                ${formatDateTime(item.created_at)}
            </div>

        `;


        historyContainer.appendChild(historyItem);

    });
}


// =========================
// Date Formatting
// =========================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =========================
// Logout
// =========================

document.getElementById("logoutButton").addEventListener(
    "click",
    function () {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "login.html";
    }
);