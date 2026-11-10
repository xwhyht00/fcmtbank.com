
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!form) return;

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    function getCustomers() {
        let customers = JSON.parse(
            localStorage.getItem("dbsDemoCustomers") || "null"
        );

        if (Array.isArray(customers)) return customers;

        customers = [];

        const profile = JSON.parse(
            localStorage.getItem("dbsDemoProfile") || "null"
        );
        const credentials = JSON.parse(
            localStorage.getItem("dbsDemoCredentials") || "null"
        );
        const bankData = JSON.parse(
            localStorage.getItem("dbsDemoData") || "null"
        );

        if (profile && credentials && bankData) {
            const accountNumber = bankData.accountNumber || "0123456789";

            customers.push({
                profile: { ...profile, accountNumber: accountNumber },
                credentials: credentials,
                bankData: { ...bankData, accountNumber: accountNumber }
            });

            localStorage.setItem(
                "dbsDemoCustomers",
                JSON.stringify(customers)
            );
        }

        return customers;
    }

    async function hashPassword(password, saltHex) {
        const salt = new Uint8Array(
            saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );

        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
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
            showMessage("Enter your email and password.");
            return;
        }

        if (!crypto.subtle) {
            showMessage("Please open the website using HTTPS.");
            return;
        }

        try {
            const customers = getCustomers();

            const customer = customers.find(item =>
                item.profile.email.toLowerCase() === email
            );

            if (!customer) {
                showMessage("Account not found. Please register first.");
                return;
            }

            const enteredHash = await hashPassword(
                password,
                customer.credentials.salt
            );

            if (enteredHash !== customer.credentials.passwordHash) {
                showMessage("Incorrect email or password.");
                return;
            }

            sessionStorage.setItem(
                "dbsDemoSession",
                JSON.stringify({
                    email: customer.profile.email,
                    accountNumber: customer.profile.accountNumber
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
