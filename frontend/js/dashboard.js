const API_BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");
const userData = localStorage.getItem("user");


// =========================================
// Authentication
// =========================================

if (!token) {
    window.location.href = "login.html";
}


// =========================================
// Display Admin
// =========================================

if (userData) {

    const user = JSON.parse(userData);

    document.getElementById("adminName").textContent =
        user.name;

}


// =========================================
// Load Dashboard
// =========================================

async function loadDashboard() {

    const message =
        document.getElementById("dashboardMessage");

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


        // =========================================
        // Authentication Error
        // =========================================

        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("access_token");
                localStorage.removeItem("user");

                window.location.href =
                    "login.html";

                return;

            }


            throw new Error(
                data.detail ||
                "Failed to load dashboard."
            );

        }


        // =========================================
        // Ticket Detail Navigation
        // =========================================

        const ticketDetailNav =
            document.getElementById("ticketDetailNav");


        if (ticketDetailNav) {

            if (
                data.latest_tickets &&
                data.latest_tickets.length > 0
            ) {

                ticketDetailNav.href =
                    `ticket-detail.html?id=${data.latest_tickets[0].id}`;

            } else {

                ticketDetailNav.href =
                    "tickets.html";

            }

        }


        // =========================================
        // Status
        // =========================================

        document.getElementById(
            "totalTickets"
        ).textContent =
            data.total_tickets;


        document.getElementById(
            "openTickets"
        ).textContent =
            data.open_tickets;


        document.getElementById(
            "inProgressTickets"
        ).textContent =
            data.in_progress_tickets;


        document.getElementById(
            "resolvedTickets"
        ).textContent =
            data.resolved_tickets;


        document.getElementById(
            "closedTickets"
        ).textContent =
            data.closed_tickets;



        // =========================================
        // Category
        // =========================================

        document.getElementById(
            "technicalTickets"
        ).textContent =
            data.category_counts.Technical || 0;


        document.getElementById(
            "billingTickets"
        ).textContent =
            data.category_counts.Billing || 0;


        document.getElementById(
            "accountTickets"
        ).textContent =
            data.category_counts.Account || 0;


        document.getElementById(
            "generalTickets"
        ).textContent =
            data.category_counts.General || 0;



        // =========================================
        // Priority
        // =========================================

        document.getElementById(
            "highPriorityTickets"
        ).textContent =
            data.priority_counts.High || 0;


        document.getElementById(
            "mediumPriorityTickets"
        ).textContent =
            data.priority_counts.Medium || 0;


        document.getElementById(
            "lowPriorityTickets"
        ).textContent =
            data.priority_counts.Low || 0;



        // =========================================
        // Last 7 Days
        // =========================================

        const last7Days =
            document.getElementById("last7Days");


        last7Days.innerHTML = "";


        // Scale every bar against the busiest day so the
        // heights actually reflect the counts. Fall back to 1
        // when every day is empty, to avoid dividing by zero.

        const busiestDay = Math.max(
            1,
            ...data.last_7_days.map(day => day.count)
        );


        data.last_7_days.forEach(day => {

            const dayElement =
                document.createElement("div");


            dayElement.className =
                "activity-day";


            // A day with no tickets keeps a small stub so the
            // column still reads as present but clearly empty.

            const barHeight =
                day.count === 0
                    ? 4
                    : Math.max(
                        10,
                        Math.round(
                            (day.count / busiestDay) * 72
                        )
                    );


            dayElement.title =
                `${day.count} ticket${day.count === 1 ? "" : "s"}`;


            dayElement.innerHTML = `

                <span>
                    ${formatActivityDate(day.date)}
                </span>

                <strong style="height: ${barHeight}px">
                    ${day.count}
                </strong>

            `;


            last7Days.appendChild(
                dayElement
            );

        });



        // =========================================
        // Latest Tickets
        // =========================================

        const latestTicketsBody =
            document.getElementById(
                "latestTicketsBody"
            );


        latestTicketsBody.innerHTML = "";


        if (
            data.latest_tickets &&
            data.latest_tickets.length > 0
        ) {


            data.latest_tickets.forEach(ticket => {

                const row =
                    document.createElement("tr");


                row.classList.add(
                    "dashboard-ticket-row"
                );


                row.innerHTML = `

                    <td>
                        <strong>
                            ${ticket.reference_number}
                        </strong>
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

                        <span class="ticket-priority priority-${ticket.priority.toLowerCase()}">

                            ${ticket.priority}

                        </span>

                    </td>

                `;


                // Open selected ticket
                row.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            `ticket-detail.html?id=${ticket.id}`;

                    }
                );


                latestTicketsBody.appendChild(
                    row
                );

            });


        } else {

            latestTicketsBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="empty-state"
                    >
                        No tickets found.
                    </td>

                </tr>

            `;

        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        message.textContent =
            error.message;


        message.style.color =
            "#dc2626";

    }

}


// =========================================
// Date Formatting
// =========================================

function formatActivityDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );

}


// =========================================
// Logout
// =========================================

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "access_token"
        );


        localStorage.removeItem(
            "user"
        );


        window.location.href =
            "login.html";

    }
);


// =========================================
// Load
// =========================================

loadDashboard();