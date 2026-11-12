
"use strict";

const CUSTOMERS_KEY = "dbsDemoCustomers";
const SESSION_KEY = "dbsDemoSession";

const recordForm = document.getElementById("recordForm");
const recordsTable = document.getElementById("recordsTable");
const message = document.getElementById("message");
const balanceElement = document.getElementById("accountBalance");
const currentYear = document.getElementById("currentYear");

document.addEventListener("DOMContentLoaded", initializeRecordsPage);

function initializeRecordsPage() {
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    if (recordForm) {
        recordForm.addEventListener("submit", handleTransaction);
    }

    updateBalance();
    renderRecords();
}

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function readJSON(storage, key, fallback) {
    try {
        const value = storage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error("Unable to read stored data:", error);
        return fallback;
    }
}

function getCurrentCustomer() {
    const session = readJSON(sessionStorage, SESSION_KEY, null);

    if (!session || !session.email) {
        return null;
    }

    const customers = readJSON(localStorage, CUSTOMERS_KEY, []);

    if (!Array.isArray(customers)) {
        return null;
    }

    return customers.find(customer => {
        if (!customer || !customer.profile || !customer.bankData) {
            return false;
        }

        const emailMatches =
            customer.profile.email === session.email;

        const accountMatches =
            !session.accountNumber ||
            customer.accountNumber === session.accountNumber ||
            customer.profile.accountNumber === session.accountNumber;

        return emailMatches && accountMatches;
    }) || null;
}

function saveCustomers(customers) {
    try {
        localStorage.setItem(
            CUSTOMERS_KEY,
            JSON.stringify(customers)
        );

        return true;
    } catch (error) {
        console.error("Unable to save customer data:", error);
        return false;
    }
}

function showMessage(text, type) {
    if (!message) return;

    message.textContent = text;
    message.className = "message " + type;
}

function updateBalance() {
    if (!balanceElement) return;

    const customer = getCurrentCustomer();

    if (!customer) {
        balanceElement.textContent = formatMoney(0);
        return;
    }

    const balance = Number(customer.bankData.balance);

    balanceElement.textContent = formatMoney(
        Number.isFinite(balance) ? balance : 0
    );
}

function renderRecords() {
    if (!recordsTable) return;

    recordsTable.replaceChildren();

    const customer = getCurrentCustomer();

    if (!customer) {
        addTableMessage("Please log in to view your records.");
        return;
    }

    const records = Array.isArray(customer.bankData.records)
        ? customer.bankData.records
        : [];

    if (records.length === 0) {
        addTableMessage("No deposit or withdrawal records yet.");
        return;
    }

    records.forEach(record => {
        const row = document.createElement("tr");

        const values = [
            record.date || "Unavailable",
            record.reference || "Demo record",
            record.type || "Transaction",
            record.description || "-",
            formatMoney(record.amount),
            record.status || "Demo Recorded"
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;

            if (index === 4) {
                const isDeposit =
                    String(record.type).toLowerCase() === "deposit";

                cell.className = isDeposit ? "credit" : "debit";
            }

            row.appendChild(cell);
        });

        recordsTable.appendChild(row);
    });
}

function addTableMessage(text) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = text;

    row.appendChild(cell);
    recordsTable.appendChild(row);
}

function handleTransaction(event) {
    event.preventDefault();

    const customer = getCurrentCustomer();

    if (!customer) {
        showMessage(
            "Please log in before recording a demo transaction.",
            "error"
        );
        return;
    }

    const type = document.getElementById("transactionType").value;
    const amountInput = document.getElementById("amount");
    const amount = Number(amountInput.value);

    const descriptionInput = document.getElementById("description");

    const description =
        descriptionInput.value.trim() ||
        type + " transaction";

    if (type !== "Deposit" && type !== "Withdrawal") {
        showMessage("Please select a transaction type.", "error");
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 100000000
    ) {
        showMessage("Enter a valid amount between ₦1 and ₦100,000,000.", "error");
        return;
    }

    const customers = readJSON(localStorage, CUSTOMERS_KEY, []);

    if (!Array.isArray(customers)) {
        showMessage("Customer data could not be loaded.", "error");
        return;
    }

    const customerIndex = customers.findIndex(item => {
        return (
            item &&
            item.profile &&
            item.profile.email === customer.profile.email &&
            (
                item.accountNumber === customer.accountNumber ||
                item.profile.accountNumber === customer.profile.accountNumber
            )
        );
    });

    if (customerIndex === -1) {
        showMessage("Customer account could not be found.", "error");
        return;
    }

    const bankData = customers[customerIndex].bankData;

    if (!bankData || typeof bankData !== "object") {
        showMessage("Account data is unavailable.", "error");
        return;
    }

    const currentBalance = Number(bankData.balance);

    if (!Number.isFinite(currentBalance) || currentBalance < 0) {
        showMessage("The demo account balance is invalid.", "error");
        return;
    }

    if (type === "Withdrawal" && amount > currentBalance) {
        showMessage("Insufficient simulated account balance.", "error");
        return;
    }

    const newBalance = type === "Deposit"
        ? currentBalance + amount
        : currentBalance - amount;

    if (!Number.isFinite(newBalance)) {
        showMessage("Unable to calculate the new balance.", "error");
        return;
    }

    if (!Array.isArray(bankData.records)) {
        bankData.records = [];
    }

    if (!Array.isArray(bankData.transactions)) {
        bankData.transactions = [];
    }

    const now = new Date();

    const reference =
        "NOVA-DEMO-" +
        now.getTime() +
        "-" +
        Math.floor(Math.random() * 1000);

    const date = now.toLocaleString("en-NG");

    const record = {
        date: date,
        reference: reference,
        type: type,
        description: description,
        amount: amount,
        status: "Demo Recorded",
        demo: true
    };

    bankData.balance = newBalance;

    bankData.records.unshift(record);

    bankData.transactions.unshift({
        date: date,
        reference: reference,
        type: type,
        description: description,
        amount: amount,
        status: "Demo Recorded",
        demo: true
    });

    if (!saveCustomers(customers)) {
        showMessage(
            "The demo transaction could not be saved. Please try again.",
            "error"
        );
        return;
    }

    updateBalance();
    renderRecords();

    recordForm.reset();

    showMessage(
        type + " recorded successfully. No real money was moved.",
        "success"
    );
}

window.addEventListener("pageshow", function() {
    updateBalance();
    renderRecords();
});
