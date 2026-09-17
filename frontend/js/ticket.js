const API_BASE_URL = "http://127.0.0.1:8000";

const ticketForm = document.getElementById("ticketForm");
const submitButton = document.getElementById("submitTicketButton");
const message = document.getElementById("ticketMessage");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const subject = document.getElementById("subject");
const description = document.getElementById("description");

const characterCount = document.getElementById("characterCount");


// =========================
// Character Counter
// =========================

description.addEventListener("input", function () {

    const count = description.value.length;

    characterCount.textContent =
        `${count} ${count === 1 ? "character" : "characters"}`;

});


// =========================
// Submit Ticket
// =========================

ticketForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    message.textContent = "";
    message.style.color = "";

    const name = customerName.value.trim();
    const email = customerEmail.value.trim();
    const ticketSubject = subject.value.trim();
    const ticketDescription = description.value.trim();


    // =========================
    // Browser Validation
    // =========================

    if (!name || !email || !ticketSubject || !ticketDescription) {

        message.textContent =
            "Please fill in all required fields.";

        message.style.color = "#dc2626";

        return;
    }


    if (name.length < 2) {

        message.textContent =
            "Name must contain at least 2 characters.";

        message.style.color = "#dc2626";

        return;
    }


    if (ticketSubject.length < 3) {

        message.textContent =
            "Subject must contain at least 3 characters.";

        message.style.color = "#dc2626";

        return;
    }


    if (ticketDescription.length < 5) {

        message.textContent =
            "Description must contain at least 5 characters.";

        message.style.color = "#dc2626";

        return;
    }


    // =========================
    // Disable Button
    // =========================

    submitButton.disabled = true;

    submitButton.textContent = "Submitting...";


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/tickets`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    customer_name: name,
                    customer_email: email,
                    subject: ticketSubject,
                    description: ticketDescription
                })
            }
        );


        const data = await response.json();


        // =========================
        // API Error
        // =========================

        if (!response.ok) {

            if (Array.isArray(data.detail)) {

                message.textContent =
                    data.detail
                        .map(error => error.msg)
                        .join(" ");

            } else {

                message.textContent =
                    data.detail || "Unable to create ticket.";

            }

            message.style.color = "#dc2626";

            return;
        }


        // =========================
        // Success
        // =========================

        console.log("Created ticket:", data);

        console.log("Reference number:", data.reference_number);
        // Pass reference number to confirmation page

        window.location.href =
            `confirmation.html?reference=${encodeURIComponent(data.reference_number)}`;


    } catch (error) {

        console.error("Ticket submission error:", error);

        message.textContent =
            "Unable to connect to the server. Please try again.";

        message.style.color = "#dc2626";

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Submit ticket";

    }

});