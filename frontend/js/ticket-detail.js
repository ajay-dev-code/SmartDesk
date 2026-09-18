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

    document.getElementById("adminName").textContent =
        user.name;

}


// =========================
// Get Ticket ID
// =========================

const urlParams =
    new URLSearchParams(window.location.search);

const ticketId =
    urlParams.get("id");


// =========================
// Messages
// =========================

const message =
    document.getElementById("ticketMessage");

const classificationMessage =
    document.getElementById("classificationMessage");


// =========================
// Classification Elements
// =========================

const categorySelect =
    document.getElementById("categorySelect");

const prioritySelect =
    document.getElementById("prioritySelect");

const saveClassificationButton =
    document.getElementById(
        "saveClassificationButton"
    );


// =========================
// Validate Ticket ID
// =========================

if (!ticketId) {

    message.textContent =
        "Ticket ID is missing.";

    message.style.color =
        "#dc2626";

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


        const data =
            await response.json();


        // =========================
        // Authentication Error
        // =========================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;
        }


        // =========================
        // API Error
        // =========================

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to load ticket."
            );

        }


        // =========================
        // Display Ticket
        // =========================

        document.getElementById(
            "ticketReference"
        ).textContent =
            data.reference_number;


        document.getElementById(
            "customerName"
        ).textContent =
            data.customer_name;


        document.getElementById(
            "customerEmail"
        ).textContent =
            data.customer_email;


        document.getElementById(
            "ticketSubject"
        ).textContent =
            data.subject;


        document.getElementById(
            "ticketDescription"
        ).textContent =
            data.description;


        document.getElementById(
            "ticketCategory"
        ).textContent =
            data.category;


        document.getElementById(
            "ticketPriority"
        ).textContent =
            data.priority;


        document.getElementById(
            "aiSummary"
        ).textContent =
            data.ai_summary ||
            "No AI summary available.";


        document.getElementById(
            "createdDate"
        ).textContent =
            formatDate(data.created_at);


        // =========================
        // Set Classification Values
        // =========================

        if (categorySelect) {

            categorySelect.value =
                data.category;

        }


        if (prioritySelect) {

            prioritySelect.value =
                data.priority;

        }


        // =========================
        // Status Badge
        // =========================

        const statusElement =
            document.getElementById(
                "ticketStatus"
            );


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

        displayStatusHistory(
            data.status_history
        );


        // =========================
        // Set Status Dropdown
        // =========================

        const statusSelect =
            document.getElementById(
                "statusSelect"
            );


        if (statusSelect) {

            statusSelect.value =
                data.status;

        }


    } catch (error) {

        console.error(
            "Ticket detail error:",
            error
        );


        message.textContent =
            error.message;

        message.style.color =
            "#dc2626";

    }

}


// =========================
// Update Classification
// =========================

if (saveClassificationButton) {

    saveClassificationButton.addEventListener(
        "click",
        async function () {


            const category =
                categorySelect.value;


            const priority =
                prioritySelect.value;


            // =========================
            // Clear Previous Message
            // =========================

            classificationMessage.textContent =
                "";


            classificationMessage.style.color =
                "";


            // =========================
            // Disable Button
            // =========================

            saveClassificationButton.disabled =
                true;


            saveClassificationButton.textContent =
                "Saving...";


            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/tickets/${ticketId}/classification`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            category:
                                category,

                            priority:
                                priority

                        })
                    }
                );


                const data =
                    await response.json();


                // =========================
                // Authentication Error
                // =========================

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "access_token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    window.location.href =
                        "login.html";

                    return;

                }


                // =========================
                // API Error
                // =========================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to update classification."
                    );

                }


                // =========================
                // Update Displayed Values
                // =========================

                document.getElementById(
                    "ticketCategory"
                ).textContent =
                    data.category;


                document.getElementById(
                    "ticketPriority"
                ).textContent =
                    data.priority;


                // =========================
                // Update Dropdown Values
                // =========================

                categorySelect.value =
                    data.category;


                prioritySelect.value =
                    data.priority;


                // =========================
                // Success Message
                // =========================

                classificationMessage.textContent =
                    "Classification updated successfully.";

                classificationMessage.style.color =
                    "#059669";


            } catch (error) {

                console.error(
                    "Classification update error:",
                    error
                );


                classificationMessage.textContent =
                    error.message;


                classificationMessage.style.color =
                    "#dc2626";


            } finally {

                saveClassificationButton.disabled =
                    false;


                saveClassificationButton.textContent =
                    "Save Classification";

            }

        }
    );

}


// =========================
// Display Status History
// =========================

function displayStatusHistory(history) {

    const historyContainer =
        document.getElementById(
            "statusHistory"
        );


    historyContainer.innerHTML =
        "";


    if (
        !history ||
        history.length === 0
    ) {

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


        historyItem.className =
            "history-item";


        historyItem.innerHTML = `

            <div class="history-status">

                <strong>
                    ${item.previous_status || "Created"}
                </strong>

                <span>
                    →
                </span>

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


        historyContainer.appendChild(
            historyItem
        );

    });

}


// =========================
// Date Formatting
// =========================

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatDateTime(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================
// Update Ticket Status
// =========================

const statusSelect =
    document.getElementById(
        "statusSelect"
    );


const statusRemark =
    document.getElementById(
        "statusRemark"
    );


const updateStatusButton =
    document.getElementById(
        "updateStatusButton"
    );


if (updateStatusButton) {

    updateStatusButton.addEventListener(
        "click",
        async function () {


            const newStatus =
                statusSelect.value;


            const remark =
                statusRemark.value.trim();


            // =========================
            // Validate Remark
            // =========================

            if (!remark) {

                message.textContent =
                    "Please enter a remark.";

                message.style.color =
                    "#dc2626";

                return;

            }


            updateStatusButton.disabled =
                true;


            updateStatusButton.textContent =
                "Updating...";


            message.textContent =
                "";


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/tickets/${ticketId}/status`,
                        {
                            method: "PATCH",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body: JSON.stringify({

                                status:
                                    newStatus,

                                remark:
                                    remark

                            })

                        }
                    );


                const data =
                    await response.json();


                // =========================
                // Authentication Error
                // =========================

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "access_token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    window.location.href =
                        "login.html";

                    return;

                }


                // =========================
                // API Error
                // =========================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to update ticket status."
                    );

                }


                // =========================
                // Update Status UI
                // =========================

                const statusElement =
                    document.getElementById(
                        "ticketStatus"
                    );


                statusElement.innerHTML = `
                    <span class="ticket-status status-${data.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}">
                        ${data.status}
                    </span>
                `;


                // =========================
                // Update Dropdown
                // =========================

                statusSelect.value =
                    data.status;


                // =========================
                // Clear Remark
                // =========================

                statusRemark.value =
                    "";


                // =========================
                // Refresh History
                // =========================

                displayStatusHistory(
                    data.status_history
                );


                // =========================
                // Success Message
                // =========================

                message.textContent =
                    "Ticket status updated successfully.";

                message.style.color =
                    "#059669";


            } catch (error) {

                console.error(
                    "Status update error:",
                    error
                );


                message.textContent =
                    error.message;

                message.style.color =
                    "#dc2626";


            } finally {

                updateStatusButton.disabled =
                    false;

                updateStatusButton.textContent =
                    "Update Status";

            }

        }
    );

}


// =========================
// Logout
// =========================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
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

}