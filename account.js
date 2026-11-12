
document.addEventListener("DOMContentLoaded", function () {
    const CUSTOMERS_KEY = "dbsDemoCustomers";
    const SESSION_KEY = "dbsDemoSession";

    const message = document.getElementById("message");
    const copyButton = document.getElementById("copyAccount");

    function readJSON(storage, key, fallback) {
        try {
            return JSON.parse(storage.getItem(key)) ?? fallback;
        } catch (error) {
            return fallback;
        }
    }

    // Read the customer's saved demo session.
    const session = readJSON(sessionStorage, SESSION_KEY, null);
    const customers = readJSON(localStorage, CUSTOMERS_KEY, []);

    if (!session || !Array.isArray(customers)) {
        window.location.href = "login.html";
        return;
    }

    // Find the currently logged-in demo customer.
    const customer = customers.find(function (item) {
        return (
            item.profile &&
            (
                item.profile.email === session.email ||
                item.accountNumber === session.accountNumber
            )
        );
    });

    if (!customer || !customer.accountNumber) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = "login.html";
        return;
    }

    const profile = customer.profile || {};
    const customerName = profile.name || "Demo Customer";
    const accountNumber = customer.accountNumber;

    // Display the customer's demo account information.
    const accountHolder = document.getElementById("accountHolder");
    const holderName = document.getElementById("holderName");
    const accountNumberCard = document.getElementById("accountNumber");
    const accountNumberDetails = document.getElementById("accountNumberDetails");
    const currentYear = document.getElementById("currentYear");

    if (accountHolder) {
        accountHolder.textContent = customerName;
    }

    if (holderName) {
        holderName.textContent = customerName;
    }

    if (accountNumberCard) {
        accountNumberCard.textContent = accountNumber;
    }

    if (accountNumberDetails) {
        accountNumberDetails.textContent = accountNumber;
    }

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Copy the simulated account number.
    if (copyButton) {
        copyButton.addEventListener("click", async function () {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(accountNumber);
                } else {
                    const temporaryInput = document.createElement("textarea");
                    temporaryInput.value = accountNumber;
                    temporaryInput.style.position = "fixed";
                    temporaryInput.style.opacity = "0";

                    document.body.appendChild(temporaryInput);
                    temporaryInput.select();

                    const copied = document.execCommand("copy");
                    temporaryInput.remove();

                    if (!copied) {
                        throw new Error("Copy failed");
                    }
                }

                if (message) {
                    message.textContent = "Demo account number copied successfully.";
                }
            } catch (error) {
                if (message) {
                    message.textContent =
                        "Unable to copy. Please copy the number manually.";
                }
            }
        });
    }
});
