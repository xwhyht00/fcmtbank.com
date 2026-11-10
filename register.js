
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");

    if (!form) return;

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    async function hashPassword(password, salt) {
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

    function createSalt() {
        const salt = crypto.getRandomValues(new Uint8Array(16));

        return Array.from(salt)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    function hexToBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);

        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }

        return bytes;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !phone || !password || !confirmPassword) {
            showMessage("Please complete all fields.");
            return;
        }

        if (password.length < 8) {
            showMessage("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Your passwords do not match.");
            return;
        }

        if (!window.crypto || !crypto.subtle) {
            showMessage("Secure registration requires the website to run on HTTPS.");
            return;
        }

        try {
            const existingProfile = JSON.parse(
                localStorage.getItem("dbsDemoProfile") || "{}"
            );

            const existingCredentials = JSON.parse(
                localStorage.getItem("dbsDemoCredentials") || "null"
            );

            if (
                existingProfile.email === email &&
                existingCredentials
            ) {
                showMessage("An account with this email already exists. Please log in.");
                return;
            }

            const salt = createSalt();
            const passwordHash = await hashPassword(
                password,
                hexToBytes(salt)
            );

            const profile = {
                name: name,
                email: email,
                phone: phone
            };

            const credentials = {
                email: email,
                salt: salt,
                passwordHash: passwordHash
            };

            localStorage.setItem(
                "dbsDemoProfile",
                JSON.stringify(profile)
            );

            localStorage.setItem(
                "dbsDemoCredentials",
                JSON.stringify(credentials)
            );

            let bankData = JSON.parse(
                localStorage.getItem("dbsDemoData") || "null"
            );

            if (!bankData) {
                bankData = {
                    balance: 0,
                    accountNumber: "0123456789",
                    beneficiaries: [],
                    transactions: [],
                    records: []
                };

                localStorage.setItem(
                    "dbsDemoData",
                    JSON.stringify(bankData)
                );
            }

            localStorage.setItem(
                "dbsDemoSession",
                JSON.stringify({
                    email: email,
                    loggedInAt: new Date().toISOString()
                })
            );

            showMessage("Registration successful. Opening your dashboard...", true);

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            showMessage("Registration could not be completed. Please try again.");
        }
    });
});
