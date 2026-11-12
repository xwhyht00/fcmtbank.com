
/* ==========================================
   NOVACREST BANK - DEMO DASHBOARD
   Fictional Banking Software Prototype
   All balances and transactions are simulated.
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // Safely read stored information.
    function readStorage(storage, key, fallback) {
        try {
            const value = storage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Unable to read demo storage:", error);
            return fallback;
        }
    }

    // Existing storage keys are preserved for compatibility.
    const session = readStorage(
        sessionStorage,
        "dbsDemoSession",
        null
    );

    const customers = readStorage(
        localStorage,
        "dbsDemoCustomers",
        []
    );

    // Require a valid demo login session.
    if (
        !session ||
        !Array.isArray(customers) ||
        !session.email ||
        !session.accountNumber
    ) {
        window.location.replace("login.html");
        return;
    }

    // Find the matching demo customer.
    const customer = customers.find(function (item) {
        return (
            item &&
            item.profile &&
            item.profile.email === session.email &&
            item.profile.accountNumber === session.accountNumber
        );
    });

    if (!customer || !customer.profile || !customer.bankData) {
        sessionStorage.removeItem("dbsDemoSession");
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
    const recentTransactions = document.getElementById("recentTransactions");
    const currentYear = document.getElementById("currentYear");

    // Format simulated amounts.
    function formatDemoCurrency(amount) {
        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "₦0.00";
        }

        return number.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN"
        });
    }

    // Display demo customer information.
    if (customerName) {
        customerName.textContent = profile.name || "Demo Customer";
    }

    // Display simulated balance.
    if (accountBalance) {
        accountBalance.textContent = formatDemoCurrency(
            bankData.balance || 0
        );
    }

    // Display demo account number.
    if (accountNumber) {
        accountNumber.textContent =
            profile.accountNumber || "Demo account unavailable";
    }

    // Display number of simulated transactions.
    if (transactionCount) {
        transactionCount.textContent = transactions.length;
    }

    // Update footer year.
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Display recent simulated transactions.
    if (recentTransactions) {

        recentTransactions.replaceChildren();

        if (transactions.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "empty-message";
            cell.textContent = "No demo transactions available.";

            row.appendChild(cell);
            recentTransactions.appendChild(row);

        } else {

            transactions.slice(0, 5).forEach(function (transaction) {

                const row = document.createElement("tr");

                const description = document.createElement("td");
                const type = document.createElement("td");
                const amount = document.createElement("td");
                const date = document.createElement("td");

                description.textContent =
                    transaction.description || "Demo transaction";

                type.textContent =
                    transaction.type || "Demo activity";

                amount.textContent = formatDemoCurrency(
                    transaction.amount || 0
                );

                const transactionDate = transaction.date
                    ? new Date(transaction.date)
                    : null;

                date.textContent =
                    transactionDate &&
                    !Number.isNaN(transactionDate.getTime())
                        ? transactionDate.toLocaleDateString("en-NG")
                        : "Date unavailable";

                row.append(
                    description,
                    type,
                    amount,
                    date
                );

                recentTransactions.appendChild(row);
            });
        }
    }

    // Explicitly identify the page as a demonstration.
    document.title = "Novacrest Bank | Demo Dashboard";

});
