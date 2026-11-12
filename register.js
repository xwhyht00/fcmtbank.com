
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");

    if (!form || !message) return;

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    function getCustomers() {
        try {
            const customers = JSON.parse(
                localStorage.getItem("dbsDemoCustomers") || "[]"
            );

            return Array.isArray(customers) ? customers : [];
        } catch {
            return [];
        }
    }

    function randomDigits(length) {
        const numbers = new Uint32Array(length);
        crypto.getRandomValues(numbers);

        return Array.from(numbers)
            .map(number => String(number % 10))
            .join("");
    }

    function createSalt() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));

        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    function hexToBytes(hex) {
        return new Uint8Array(
            hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );
    }

    async function hashPassword(password, salt) {
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );

        const result = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 310000,
                hash: "SHA-256"
            },
            key,
            256
        );

        return Array.from(new Uint8Array(result))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    function createAccountNumber(customers) {
        let accountNumber;

        do {
            accountNumber = "9" + randomDigits(9);
        } while (
            customers.some(customer =>
                customer.profile &&
                customer.profile.accountNumber === accountNumber
            )
        );

        return accountNumber;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document
            .getElementById("fullname")
            .value.trim();

        if (!name) {
            showMessage("Enter a fictional display name.");
            return;
        }

        if (!window.crypto || !crypto.subtle) {
            showMessage("Please open the demo website using HTTPS.");
            return;
        }

        const button = form.querySelector('button[type="submit"]');

        if (button) {
            button.disabled = true;
            button.textContent = "Creating demo profile...";
        }

        try {
            const customers = getCustomers();

            const demoID = randomDigits(8);
            const demoEmail = "demo" + demoID + "@example.invalid";
            const demoPassword = "Demo-" + randomDigits(12);
            const accountNumber = createAccountNumber(customers);

            const salt = createSalt();

            const passwordHash = await hashPassword(
                demoPassword,
                hexToBytes(salt)
            );

            const newCustomer = {
                profile: {
                    name: name,
                    email: demoEmail,
                    phone: "DEMO ONLY",
                    accountNumber: accountNumber
                },

                credentials: {
                    email: demoEmail,
                    salt: salt,
                    passwordHash: passwordHash
                },

                bankData: {
                    balance: 0,
                    accountNumber: accountNumber,
                    beneficiaries: [],
                    transactions: [],
                    records: []
                }
            };

            customers.push(newCustomer);

            localStorage.setItem(
                "dbsDemoCustomers",
                JSON.stringify(customers)
            );

            sessionStorage.setItem(
                "dbsDemoSession",
                JSON.stringify({
                    email: demoEmail,
                    accountNumber: accountNumber
                })
            );

            message.style.color = "#0877bd";
            message.textContent =
                "Demo profile created successfully. " +
                "Login ID: " + demoEmail +
                " | Demo password: " + demoPassword +
                " | Demo account number: " + accountNumber +
                ". Save these fictional demo details.";

            form.reset();

            if (button) {
                button.textContent = "Demo Profile Created";
            }

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 8000);

        } catch (error) {
            console.error(error);

            showMessage(
                "Demo registration failed. Please try again."
            );

            if (button) {
                button.disabled = false;
                button.textContent = "Create Demo Profile";
            }
        }
    });
});
