const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("loginMessage");

    message.textContent = "";

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        message.style.color = "#dc2626";
        return;
    }

    message.textContent = "Login form is ready.";
    message.style.color = "#059669";
});