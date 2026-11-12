
document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutBtn");
    const message = document.getElementById("message");
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    function logout() {
        // End only the current demo session.
        // Keep saved demo customer accounts and transactions.
        sessionStorage.removeItem("dbsDemoSession");

        if (message) {
            message.textContent = "You have been logged out. Redirecting...";
        }

        window.location.replace("login.html");
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    } else {
        // Automatically log out if there is no confirmation button.
        logout();
    }
});
