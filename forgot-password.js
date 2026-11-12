
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const recoveryForm = document.getElementById("recoveryForm");
    const message = document.getElementById("message");
    const emailInput = document.getElementById("email");
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    if (!recoveryForm || !message || !emailInput) {
        return;
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "message " + type;
    }

    recoveryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            showMessage(
                "Please enter your demo email address.",
                "error"
            );
            return;
        }

        if (email.length > 150) {
            showMessage(
                "The email address is too long.",
                "error"
            );
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        showMessage(
            "Your email format is valid. This fictional prototype cannot send password reset emails or change account passwords. No recovery request has been sent.",
            "success"
        );
    });
});
