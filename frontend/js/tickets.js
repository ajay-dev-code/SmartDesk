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
// Elements
// =========================

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priorityFilter = document.getElementById("priorityFilter");

const ticketTableBody = document.getElementById("ticketTableBody");
const ticketCount = document.getElementById("ticketCount");

const previousPageButton = document.getElementById("previousPage");
const nextPageButton = document.getElementById("nextPage");

const pageInfo = document.getElementById("pageInfo");
const message = document.getElementById("ticketsMessage");


// =========================
// Pagination
// =========================

let currentPage = 1;

const pageSize = 10;


// =========================
// Load Tickets
// =========================

async function loadTickets() {

    message.textContent = "";

    ticketTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                Loading tickets...
            </td>
        </tr>
    `;

    try {

        const params = new URLSearchParams();

        params.append("page", currentPage);
        params.append("page_size", pageSize);


        // Search

        if (searchInput.value.trim()) {

            params.append(
                "search",
                searchInput.value.trim()
            );
        }


        // Status

        if (statusFilter.value) {

            params.append(
                "status",
                statusFilter.value
            );
        }


        // Category

        if (categoryFilter.value) {

            params.append(
                "category",
                categoryFilter.value
            );
        }


        // Priority

        if (priorityFilter.value) {

            params.append(
                "priority",
                priorityFilter.value
            );
        }


        const response = await fetch(
            `${API_BASE_URL}/api/tickets?${params.toString()}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        // Authentication error

        if (response.status === 401 || response.status === 403) {

            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            window.location.href = "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                data.detail || "Failed to load tickets."
            );
        }


        // =========================
        // Display Tickets
        // =========================

        ticketTableBody.innerHTML = "";


        if (data.items.length === 0) {

            ticketTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        No tickets found.
                    </td>
                </tr>
            `;

        } else {

            data.items.forEach(ticket => {

                const row = document.createElement("tr");

                row.innerHTML = `

                    <td>
                        <strong>${ticket.reference_number}</strong>
                    </td>

                    <td>
                        ${ticket.customer_name}
                    </td>

                    <td>
                        ${ticket.subject}
                    </td>

                    <td>
                        <span class="ticket-status status-${ticket.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}">
                            ${ticket.status}
                        </span>
                    </td>

                    <td>
                        ${ticket.category}
                    </td>

                    <td>
                        <span class="ticket-priority priority-${ticket.priority.toLowerCase()}">
                            ${ticket.priority}
                        </span>
                    </td>

                    <td>
                        ${formatDate(ticket.created_at)}
                    </td>

                `;

                ticketTableBody.appendChild(row);

            });
        }


        // =========================
        // Pagination Information
        // =========================

        ticketCount.textContent =
            `${data.total} ${data.total === 1 ? "ticket" : "tickets"}`;

        pageInfo.textContent =
            `Page ${data.page} of ${data.total_pages || 1}`;


        previousPageButton.disabled =
            data.page <= 1;

        nextPageButton.disabled =
            data.page >= data.total_pages;


    } catch (error) {

        console.error("Ticket loading error:", error);

        ticketTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Unable to load tickets.
                </td>
            </tr>
        `;

        message.textContent = error.message;
        message.style.color = "#dc2626";
    }
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


// =========================
// Search
// =========================

let searchTimeout;

searchInput.addEventListener("input", function () {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(function () {

        currentPage = 1;

        loadTickets();

    }, 400);
});


// =========================
// Filters
// =========================

statusFilter.addEventListener("change", function () {

    currentPage = 1;

    loadTickets();
});


categoryFilter.addEventListener("change", function () {

    currentPage = 1;

    loadTickets();
});


priorityFilter.addEventListener("change", function () {

    currentPage = 1;

    loadTickets();
});


// =========================
// Previous Page
// =========================

previousPageButton.addEventListener(
    "click",
    function () {

        if (currentPage > 1) {

            currentPage--;

            loadTickets();
        }
    }
);


// =========================
// Next Page
// =========================

nextPageButton.addEventListener(
    "click",
    function () {

        currentPage++;

        loadTickets();
    }
);


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


// =========================
// Initial Load
// =========================

loadTickets();