const loginForm =
    document.getElementById("loginForm");


const API_BASE_URL =
    "http://127.0.0.1:8000";


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email")
                .value
                .trim();


        const password =
            document.getElementById("password")
                .value
                .trim();


        const message =
            document.getElementById(
                "loginMessage"
            );


        const loginButton =
            document.querySelector(
                ".login-button"
            );


        // Clear previous message

        message.textContent = "";

        message.style.color = "";



        // =========================
        // Basic Validation
        // =========================

        if (!email || !password) {

            message.textContent =
                "Please enter email and password.";

            message.style.color =
                "#dc2626";

            return;
        }



        // =========================
        // Disable Button
        // =========================

        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";



        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();



            // =========================
            // Login Error
            // =========================

            if (!response.ok) {

                message.textContent =
                    "Invalid email or password.";

                message.style.color =
                    "#dc2626";

                return;
            }



            // =========================
            // Login Success
            // =========================

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            message.textContent =
                "Login successful!";

            message.style.color =
                "#059669";


            console.log(
                "Logged in user:",
                data.user
            );


            // Go to dashboard

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            message.textContent =
                "Unable to connect to the server. Please try again.";

            message.style.color =
                "#dc2626";


        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Sign in";

        }

    }
);