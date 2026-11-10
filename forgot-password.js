
const recoveryForm = document.getElementById("recoveryForm");
const message = document.getElementById("message");

recoveryForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        message.textContent = "Please enter your email address.";
        message.className = "error";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = "Please enter a valid email address.";
        message.className = "error";
        return;
    }

    message.textContent =
        "Your email format is valid. Actual password recovery " +
        "requires a secure server and email service.";

    message.className = "success";
});
