
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!form) return;

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    async function hashPassword(password, saltHex) {
        const salt = new Uint8Array(
            saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );

        const encoder = new TextEncoder();

        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );

        const bits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 310000,
                hash: "SHA-256"
            },
            key,
            256
        );

        return Array.from(new Uint8Array(bits))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        if (!window.crypto || !crypto.subtle) {
            showMessage("Secure login requires the website to run on HTTPS.");
            return;
        }

        try {
            const credentials = JSON.parse(
                localStorage.getItem("dbsDemoCredentials") || "null"
            );

            const profile = JSON.parse(
                localStorage.getItem("dbsDemoProfile") || "null"
            );

            if (!credentials || !profile) {
                showMessage("No registered account was found. Please register first.");
                return;
            }

            if (credentials.email !== email || profile.email !== email) {
                showMessage("Incorrect email or password.");
                return;
            }

            const enteredPasswordHash = await hashPassword(
                password,
                credentials.salt
            );

            if (enteredPasswordHash !== credentials.passwordHash) {
                showMessage("Incorrect email or password.");
                return;
            }

            localStorage.setItem(
                "dbsDemoSession",
                JSON.stringify({
                    email: email,
                    loggedInAt: new Date().toISOString()
                })
            );

            showMessage("Login successful. Opening your dashboard...", true);

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            showMessage("Login could not be completed. Please try again.");
        }
    });
});
