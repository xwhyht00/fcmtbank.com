
const logoutButton = document.getElementById("logoutBtn");
const message = document.getElementById("message");

logoutButton.addEventListener("click", function() {

    // Remove only the demo session marker.
    // Do not delete the saved profile or demo transactions.
    localStorage.removeItem("dbsDemoSession");

    message.textContent = "Demo session ended. Redirecting to login...";

    logoutButton.disabled = true;
    logoutButton.textContent = "Logged Out";

    setTimeout(function() {
        window.location.href = "login.html";
    }, 1500);

});
