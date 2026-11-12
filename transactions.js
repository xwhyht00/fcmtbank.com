
/* =========================================
   NOVACREST BANK
   TRANSACTION HISTORY
   Fictional Banking Prototype
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const CUSTOMERS_KEY = "dbsDemoCustomers";
    const SESSION_KEY = "dbsDemoSession";

    const transactionTable =
        document.getElementById("transactionTable");

    const emptyMessage =
        document.getElementById("emptyMessage");

    const refreshButton =
        document.getElementById("refreshBtn");

    const totalTransactions =
        document.getElementById("totalTransactions");

    const totalDeposits =
        document.getElementById("totalDeposits");

    const totalWithdrawals =
        document.getElementById("totalWithdrawals");

    const yearElement =
        document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (!transactionTable) {
        console.error("Transaction table was not found.");
        return;
    }

    /* =====================================
       STORAGE HELPERS
    ===================================== */

    function readStorage(storage, key, fallback) {

        try {
            const value = storage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value) ?? fallback;

        } catch (error) {
            console.error("Storage read error:", error);
            return fallback;
        }
    }

    /* =====================================
       CURRENCY FORMATTER
    ===================================== */

    function formatMoney(amount) {

        const value = Number(amount);

        return (Number.isFinite(value) ? value : 0)
            .toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
    }

    /* =====================================
       CURRENT CUSTOMER
    ===================================== */

    function getCurrentCustomer() {

        const session = readStorage(
            sessionStorage,
            SESSION_KEY,
            null
        );

        if (!session || !session.email) {

            window.location.href = "login.html";

            return null;
        }

        const customers = readStorage(
            localStorage,
            CUSTOMERS_KEY,
            []
        );

        if (!Array.isArray(customers)) {
            showError("Demo customer records could not be loaded.");
            return null;
        }

        const customer = customers.find(function (item) {

            if (!item || !item.profile) {
                return false;
            }

            const emailMatches =
                item.profile.email === session.email;

            const accountNumber =
                item.accountNumber ||
                item.profile.accountNumber;

            const accountMatches =
                !session.accountNumber ||
                accountNumber === session.accountNumber;

            return emailMatches && accountMatches;
        });

        if (!customer) {

            sessionStorage.removeItem(SESSION_KEY);

            window.location.href = "login.html";

            return null;
        }

        return customer;
    }

    /* =====================================
       TRANSACTION HELPERS
    ===================================== */

    function getTransactionType(transaction) {

        return String(
            transaction.type ||
            transaction.description ||
            "Transaction"
        ).trim();
    }

    function getTransactionAmount(transaction) {

        const amount = Number(transaction.amount);

        return Number.isFinite(amount) ? Math.abs(amount) : 0;
    }

    function getTransactionDate(transaction) {

        if (!transaction.date) {
            return 0;
        }

        const timestamp = new Date(transaction.date).getTime();

        return Number.isFinite(timestamp) ? timestamp : 0;
    }

    function getTransactionStatus(transaction) {

        return transaction.status || "Demo Recorded";
    }

    /* =====================================
       COLLECT TRANSACTIONS
    ===================================== */

    function collectTransactions(customer) {

        const data = customer.bankData || {};

        const transactions = Array.isArray(data.transactions)
            ? data.transactions
            : [];

        const records = Array.isArray(data.records)
            ? data.records
            : [];

        const allTransactions = [];

        const seenReferences = new Set();

        function addTransaction(item) {

            if (!item || typeof item !== "object") {
                return;
            }

            const reference = item.reference
                ? String(item.reference)
                : "";

            if (reference && seenReferences.has(reference)) {
                return;
            }

            if (reference) {
                seenReferences.add(reference);
            }

            allTransactions.push(item);
        }

        transactions.forEach(addTransaction);
        records.forEach(addTransaction);

        allTransactions.sort(function (a, b) {

            return getTransactionDate(b) -
                   getTransactionDate(a);
        });

        return allTransactions;
    }

    /* =====================================
       EMPTY TABLE MESSAGE
    ===================================== */

    function showEmptyTransactions() {

        transactionTable.replaceChildren();

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent =
            "No demonstration transactions recorded yet.";

        row.appendChild(cell);

        transactionTable.appendChild(row);

        if (emptyMessage) {
            emptyMessage.hidden = false;
        }
    }

    /* =====================================
       ERROR DISPLAY
    ===================================== */

    function showError(text) {

        transactionTable.replaceChildren();

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent = text;

        row.appendChild(cell);

        transactionTable.appendChild(row);
    }

    /* =====================================
       UPDATE SUMMARY
    ===================================== */

    function updateSummary(transactions) {

        let deposits = 0;
        let withdrawals = 0;

        transactions.forEach(function (transaction) {

            const type = getTransactionType(
                transaction
            ).toLowerCase();

            const amount = getTransactionAmount(
                transaction
            );

            if (type.includes("deposit")) {
                deposits += amount;
            }

            if (type.includes("withdraw")) {
                withdrawals += amount;
            }
        });

        if (totalTransactions) {
            totalTransactions.textContent =
                transactions.length.toLocaleString("en-NG");
        }

        if (totalDeposits) {
            totalDeposits.textContent =
                formatMoney(deposits);
        }

        if (totalWithdrawals) {
            totalWithdrawals.textContent =
                formatMoney(withdrawals);
        }
    }

    /* =====================================
       RENDER TRANSACTION ROW
    ===================================== */

    function createTransactionRow(transaction) {

        const row = document.createElement("tr");

        const type = getTransactionType(transaction);

        const typeLower = type.toLowerCase();

        const amount = getTransactionAmount(transaction);

        const isCredit =
            typeLower.includes("deposit") ||
            typeLower.includes("credit");

        const amountClass = isCredit
            ? "amount-credit"
            : "amount-debit";

        const sign = isCredit ? "+" : "-";

        const timestamp = getTransactionDate(transaction);

        const date = timestamp
            ? new Date(timestamp).toLocaleString("en-NG")
            : "Date unavailable";

        const reference =
            transaction.reference || "Demo Record";

        const description =
            transaction.detail ||
            transaction.narration ||
            transaction.description ||
            "Simulated account activity";

        const values = [
            date,
            reference,
            description,
            type,
            sign + formatMoney(amount)
        ];

        values.forEach(function (value, index) {

            const cell = document.createElement("td");

            cell.textContent = String(value);

            if (index === 4) {
                cell.className = amountClass;
            }

            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className = "status";

        status.textContent = getTransactionStatus(
            transaction
        );

        statusCell.appendChild(status);

        row.appendChild(statusCell);

        return row;
    }

    /* =====================================
       RENDER TRANSACTION HISTORY
    ===================================== */

    function renderTransactions() {

        const customer = getCurrentCustomer();

        if (!customer) {
            return;
        }

        const transactions = collectTransactions(customer);

        updateSummary(transactions);

        transactionTable.replaceChildren();

        if (transactions.length === 0) {

            showEmptyTransactions();

            return;
        }

        if (emptyMessage) {
            emptyMessage.hidden = true;
        }

        const fragment = document.createDocumentFragment();

        transactions.forEach(function (transaction) {

            const row = createTransactionRow(transaction);

            fragment.appendChild(row);
        });

        transactionTable.appendChild(fragment);
    }

    /* =====================================
       REFRESH BUTTON
    ===================================== */

    if (refreshButton) {

        refreshButton.addEventListener("click", function () {

            refreshButton.disabled = true;

            refreshButton.textContent = "Refreshing...";

            renderTransactions();

            refreshButton.textContent = "Refresh Records";

            refreshButton.disabled = false;
        });
    }

    /* =====================================
       PAGE REFRESH
    ===================================== */

    renderTransactions();

    window.addEventListener("pageshow", function () {

        renderTransactions();
    });

});
