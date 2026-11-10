
const STORAGE_KEY = "dbsDemoData";

const transactionTable = document.getElementById("transactionTable");
const emptyMessage = document.getElementById("emptyMessage");

function getData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        const data = saved && typeof saved === "object" ? saved : {};

        if (!Array.isArray(data.transactions)) {
            data.transactions = [];
        }

        if (!Array.isArray(data.records)) {
            data.records = [];
        }

        if (!Array.isArray(data.beneficiaries)) {
            data.beneficiaries = [];
        }

        if (typeof data.balance !== "number") {
            data.balance = 250000;
        }

        return data;

    } catch (error) {
        return {
            balance: 250000,
            beneficiaries: [],
            transactions: [],
            records: []
        };
    }
}

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[char];
    });
}

function getTransactionType(transaction) {
    return String(
        transaction.type || transaction.description || "Transaction"
    );
}

function renderTransactions() {
    const data = getData();

    const transactions = [...data.transactions].reverse();

    transactionTable.innerHTML = "";

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    data.transactions.forEach(function(transaction) {
        const type = getTransactionType(transaction).toLowerCase();
        const amount = Number(transaction.amount) || 0;

        if (type.includes("deposit")) {
            totalDeposits += amount;
        }

        if (type.includes("withdraw")) {
            totalWithdrawals += amount;
        }
    });

    document.getElementById("totalTransactions").textContent =
        data.transactions.length;

    document.getElementById("totalDeposits").textContent =
        formatMoney(totalDeposits);

    document.getElementById("totalWithdrawals").textContent =
        formatMoney(totalWithdrawals);

    if (transactions.length === 0) {
        emptyMessage.hidden = false;

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No transactions recorded.";

        row.appendChild(cell);
        transactionTable.appendChild(row);

        return;
    }

    emptyMessage.hidden = true;

    transactions.forEach(function(transaction) {
        const row = document.createElement("tr");

        const date = transaction.date || "Date unavailable";
        const reference = transaction.reference || "Demo transaction";
        const description = transaction.description || transaction.type || "Transaction";
        const type = getTransactionType(transaction);
        const amount = Number(transaction.amount) || 0;

        const typeLower = type.toLowerCase();

        const isCredit = typeLower.includes("deposit");

        const amountClass = isCredit
            ? "amount-credit"
            : "amount-debit";

        const sign = isCredit ? "+" : "-";

        row.innerHTML = `
            <td>${escapeHTML(date)}</td>
            <td>${escapeHTML(reference)}</td>
            <td>${escapeHTML(description)}</td>
            <td>${escapeHTML(type)}</td>
            <td class="${amountClass}">
                ${sign}${escapeHTML(formatMoney(amount))}
            </td>
            <td><span class="status">Demo Recorded</span></td>
        `;

        transactionTable.appendChild(row);
    });
}

document.getElementById("refreshBtn").addEventListener("click", function() {
    renderTransactions();
});

renderTransactions();
