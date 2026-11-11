
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!form || !message) return;

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    function getCustomers() {
        let customers = JSON.parse(
            localStorage.getItem("dbsDemoCustomers") || "null"
        );

        if (Array.isArray(customers)) {
            return customers;
        }

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
            const accountNumber =
                bankData.accountNumber || "0123456789";

            customers.push({
                profile: {
                    ...profile,
                    accountNumber: accountNumber
                },
                credentials: credentials,
                bankData: {
                    ...bankData,
                    accountNumber: accountNumber
                }
            });

            localStorage.setItem(
                "dbsDemoCustomers",
                JSON.stringify(customers)
            );
        }

        return customers;
    }

    async function hashPassword(password, saltHex) {
        if (
            !saltHex ||
            typeof saltHex !== "string" ||
            !/^[0-9a-f]+$/i.test(saltHex) ||
            saltHex.length % 2 !== 0
        ) {
            throw new Error("Invalid demo password data.");
        }

        const salt = new Uint8Array(
            saltHex.match(/.{1,2}/g).map(byte =>
                parseInt(byte, 16)
            )
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

        const email = document
            .getElementById("email")
            .value.trim()
            .toLowerCase();

        const password = document.getElementById("password").value;

        if (!email || !password) {
            showMessage("Enter your demo email and password.");
            return;
        }

        if (!window.crypto || !window.crypto.subtle) {
            showMessage(
                "Secure browser features are unavailable. Please use HTTPS."
            );
            return;
        }

        const submitButton = form.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Checking demo account...";
        }

        try {
            const customers = getCustomers();

            const customer = customers.find(item =>
                item &&
                item.profile &&
                item.profile.email &&
                item.profile.email.toLowerCase() === email
            );

            if (!customer) {
                showMessage(
                    "Demo account not found. Please create a demo account."
                );
                return;
            }

            if (
                !customer.credentials ||
                !customer.credentials.salt ||
                !customer.credentials.passwordHash
            ) {
                showMessage(
                    "Demo account information is incomplete."
                );
                return;
            }

            const enteredHash = await hashPassword(
                password,
                customer.credentials.salt
            );

            if (enteredHash !== customer.credentials.passwordHash) {
                showMessage("Incorrect demo email or password.");
                return;
            }

            sessionStorage.setItem(
                "dbsDemoSession",
                JSON.stringify({
                    email: customer.profile.email,
                    accountNumber:
                        customer.profile.accountNumber ||
                        customer.bankData?.accountNumber ||
                        ""
                })
            );

            showMessage(
                "Demo login successful. Opening your dashboard...",
                true
            );

            window.location.href = "dashboard.html";

        } catch (error) {
            showMessage(
                "Demo login could not be completed. Please try again."
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Sign In to Demo";
            }
        }
    });
});
