
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
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

        // Preserve a previously registered single customer.
        const oldProfile = JSON.parse(
            localStorage.getItem("dbsDemoProfile") || "null"
        );
        const oldCredentials = JSON.parse(
            localStorage.getItem("dbsDemoCredentials") || "null"
        );
        const oldData = JSON.parse(
            localStorage.getItem("dbsDemoData") || "null"
        );

        if (oldProfile && oldCredentials && oldData) {
            customers.push({
                profile: {
                    ...oldProfile,
                    accountNumber: oldData.accountNumber || "0123456789"
                },
                credentials: oldCredentials,
                bankData: {
                    ...oldData,
                    accountNumber: oldData.accountNumber || "0123456789"
                }
            });
        }

        return customers;
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

    function createAccountNumber(customers) {
        let number;

        do {
            const bytes = crypto.getRandomValues(new Uint32Array(1));
            number = String(1000000000 + (bytes[0] % 9000000000));
        } while (
            customers.some(customer =>
                customer.profile.accountNumber === number
            )
        );

        return number;
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
            showMessage("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Your passwords do not match.");
            return;
        }

        if (!crypto.subtle) {
            showMessage("Please open the website using HTTPS.");
            return;
        }

        try {
            const customers = getCustomers();

            const alreadyRegistered = customers.some(customer =>
                customer.profile.email.toLowerCase() === email
            );

            if (alreadyRegistered) {
                showMessage("This email is already registered. Please log in.");
                return;
            }

            const accountNumber = createAccountNumber(customers);
            const salt = createSalt();
            const passwordHash = await hashPassword(
                password,
                hexToBytes(salt)
            );

            const newCustomer = {
                profile: {
                    name: name,
                    email: email,
                    phone: phone,
                    accountNumber: accountNumber
                },
                credentials: {
                    email: email,
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

            // Session identifies this particular customer.
            sessionStorage.setItem(
                "dbsDemoSession",
                JSON.stringify({
                    email: email,
                    accountNumber: accountNumber
                })
            );

            showMessage(
                "Registration successful. Your test account number is " +
                accountNumber,
                true
            );

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1500);

        } catch (error) {
            console.error(error);
            showMessage("Registration could not be completed. Please try again.");
        }
    });
});
