
document.addEventListener("DOMContentLoaded", function () {
    // End the current browser session without deleting the customer profile.
    localStorage.removeItem("dbsDemoSession");

    // Return the customer to the login page.
    window.location.replace("login.html");
});
