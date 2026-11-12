
/* ==========================================
   NOVACREST BANK
   FICTIONAL BANKING SOFTWARE PROTOTYPE
   All balances and transactions are simulated.
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const SESSION_KEY = "dbsDemoSession";
    const CUSTOMERS_KEY = "dbsDemoCustomers";

    // Safely read JSON data from storage.
    function readStorage(storage, key, fallback) {
        try {
            const value = storage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Demo storage error:", error);
            return fallback;
        }
    }

    // Load the current demo session.
    const session = readStorage(sessionStorage, SESSION_KEY, null);

    const customers = readStorage(
        localStorage,
        CUSTOMERS_KEY,
        []
    );

    // Require a valid demo session.
    if (
        !session ||
        !session.email ||
        !session.accountNumber ||
        !Array.isArray(customers)
    ) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("login.html");
        return;
    }

    // Find the logged-in demo customer.
    const customer = customers.find(function (item) {
        if (!item || !item.profile) {
            return false;
        }

        const customerEmail = item.profile.email || "";
        const customerAccount =
            item.accountNumber || item.profile.accountNumber || "";

        const profileAccount =
            item.profile.accountNumber || item.accountNumber || "";

        return (
            customerEmail.toLowerCase() ===
                String(session.email).toLowerCase() &&
            (
                customerAccount === session.accountNumber ||
                profileAccount === session.accountNumber
            )
        );
    });

    // Stop if the demo account cannot be found.
    if (!customer || !customer.profile || !customer.bankData) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("login.html");
        return;
    }

    const profile = customer.profile;
    const bankData = customer.bankData;

    const transactions = Array.isArray(bankData.transactions)
        ? bankData.transactions
        : [];

    // Dashboard elements.
    const customerName = document.getElementById("customerName");
    const accountBalance = document.getElementById("accountBalance");
    const accountNumber = document.getElementById("accountNumber");
    const transactionCount = document.getElementById("transactionCount");
    const recentTransactions =
        document.getElementById("recentTransactions");
    const currentYear = document.getElementById("currentYear");

    // Format simulated Nigerian Naira amounts.
    function formatDemoCurrency(amount) {
        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "₦0.00";
        }

        return number.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Safely format transaction dates.
    function formatDate(value) {
        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // Display demo customer name.
    if (customerName) {
        customerName.textContent =
            profile.name || "Demo Customer";
    }

    // Display simulated account balance.
    if (accountBalance) {
        accountBalance.textContent = formatDemoCurrency(
            bankData.balance || 0
        );
    }

    // Display demo account number.
    if (accountNumber) {
        accountNumber.textContent =
            customer.accountNumber ||
            profile.accountNumber ||
            "Demo account unavailable";
    }

    // Display transaction count.
    if (transactionCount) {
        transactionCount.textContent = transactions.length;
    }

    // Update footer year.
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Display the five most recent demo transactions.
    if (recentTransactions) {
        recentTransactions.replaceChildren();

        const sortedTransactions = [...transactions].sort(
            function (a, b) {
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();

                return dateB - dateA;
            }
        );

        if (sortedTransactions.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "empty-message";
            cell.textContent = "No demo transactions available.";

            row.appendChild(cell);
            recentTransactions.appendChild(row);

        } else {
            sortedTransactions.slice(0, 5).forEach(
                function (transaction) {
                    const row = document.createElement("tr");

                    const description = document.createElement("td");
                    const type = document.createElement("td");
                    const amount = document.createElement("td");
                    const date = document.createElement("td");

                    description.textContent =
                        transaction.description ||
                        transaction.detail ||
                        "Demo transaction";

                    type.textContent =
                        transaction.type || "Demo activity";

                    amount.textContent = formatDemoCurrency(
                        transaction.amount || 0
                    );

                    date.textContent = formatDate(transaction.date);

                    row.append(
                        description,
                        type,
                        amount,
                        date
                    );

                    recentTransactions.appendChild(row);
                }
            );
        }
    }

    // Keep the prototype clearly identified.
    document.title = "Novacrest | Demo Dashboard";
});
