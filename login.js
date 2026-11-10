
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.style.color = "red";
        message.textContent = "Please enter your email and password.";
        return;
    }

    message.style.color = "#0877bd";
    message.textContent =
        "Login form validated. Secure server authentication is required to access a real banking account.";
});
