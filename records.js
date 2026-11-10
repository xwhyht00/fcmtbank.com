
const STORAGE_KEY = "dbsDemoData";

const recordForm = document.getElementById("recordForm");
const recordsTable = document.getElementById("recordsTable");
const message = document.getElementById("message");

function getData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        const data = saved && typeof saved === "object" ? saved : {};

        if (typeof data.balance !== "number") {
            data.balance = 250000;
        }

        if (!Array.isArray(data.records)) {
            data.records = [];
        }

        if (!Array.isArray(data.transactions)) {
            data.transactions = [];
        }

        if (!Array.isArray(data.beneficiaries)) {
            data.beneficiaries = [];
        }

        return data;

    } catch (error) {
        return {
            balance: 250000,
            records: [],
            transactions: [],
            beneficiaries: []
        };
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatMoney(amount) {
    return Number(amount).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    });
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function updateBalance() {
    const data = getData();

    document.getElementById("accountBalance").textContent =
        formatMoney(data.balance);
}

function renderRecords() {
    const data = getData();

    recordsTable.innerHTML = "";

    if (data.records.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No deposit or withdrawal records yet.";

        row.appendChild(cell);
        recordsTable.appendChild(row);
        return;
    }

    [...data.records].reverse().forEach(function(record) {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = record.date || "Unavailable";

        const referenceCell = document.createElement("td");
        referenceCell.textContent = record.reference || "Demo record";

        const typeCell = document.createElement("td");
        typeCell.textContent = record.type || "Transaction";

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = record.description || "-";

        const amountCell = document.createElement("td");
        amountCell.textContent = formatMoney(record.amount);
        amountCell.className =
            record.type === "Deposit" ? "credit" : "debit";

        const statusCell = document.createElement("td");
        statusCell.textContent = "Demo Recorded";

        row.append(
            dateCell,
            referenceCell,
            typeCell,
            descriptionCell,
            amountCell,
            statusCell
        );

        recordsTable.appendChild(row);
    });
}

recordForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = document.getElementById("transactionType").value;
    const amount = Number(document.getElementById("amount").value);
    const description =
        document.getElementById("description").value.trim() ||
        type + " transaction";

    if (!type) {
        showMessage("Please select a transaction type.", "error");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        showMessage("Enter a valid amount greater than zero.", "error");
        return;
    }

    const data = getData();

    if (type === "Withdrawal" && amount > data.balance) {
        showMessage("Insufficient demo account balance.", "error");
        return;
    }

    if (type === "Deposit") {
        data.balance += amount;
    } else {
        data.balance -= amount;
    }

    const now = new Date();
    const reference =
        "DBS" + now.getTime().toString();

    const date = now.toLocaleString("en-NG");

    const record = {
        date: date,
        reference: reference,
        type: type,
        description: description,
        amount: amount
    };

    data.records.push(record);

    // Also add the entry to transaction history.
    data.transactions.push({
        date: date,
        reference: reference,
        type: type,
        description: description,
        amount: amount
    });

    saveData(data);

    updateBalance();
    renderRecords();

    recordForm.reset();

    showMessage(
        type + " recorded successfully in the demo.",
        "success"
    );
});

updateBalance();
renderRecords();
