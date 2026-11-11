
const CUSTOMERS_KEY = "dbsDemoCustomers";
const SESSION_KEY = "dbsDemoSession";

const recordForm = document.getElementById("recordForm");
const recordsTable = document.getElementById("recordsTable");
const message = document.getElementById("message");

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    });
}

function getCurrentCustomer() {
    const session = JSON.parse(
        sessionStorage.getItem(SESSION_KEY) || "null"
    );

    if (!session) return null;

    const customers = JSON.parse(
        localStorage.getItem(CUSTOMERS_KEY) || "[]"
    );

    return customers.find(customer =>
        customer.profile &&
        customer.bankData &&
        customer.profile.email === session.email &&
        customer.profile.accountNumber === session.accountNumber
    ) || null;
}

function saveCustomers(customers) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function showMessage(text, type) {
    if (!message) return;

    message.textContent = text;
    message.className = "message " + type;
}

function updateBalance() {
    const customer = getCurrentCustomer();
    const balanceElement = document.getElementById("accountBalance");

    if (!balanceElement) return;

    if (!customer) {
        balanceElement.textContent = formatMoney(0);
        showMessage("Please log in to view your account balance.", "error");
        return;
    }

    balanceElement.textContent = formatMoney(
        customer.bankData.balance
    );
}

function renderRecords() {
    if (!recordsTable) return;

    const customer = getCurrentCustomer();

    recordsTable.innerHTML = "";

    if (!customer) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "Please log in to view your records.";

        row.appendChild(cell);
        recordsTable.appendChild(row);
        return;
    }

    const records = customer.bankData.records || [];

    if (records.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No deposit or withdrawal records yet.";

        row.appendChild(cell);
        recordsTable.appendChild(row);
        return;
    }

    [...records].reverse().forEach(record => {
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
                cell.className =
                    String(record.type).toLowerCase().includes("deposit")
                    ? "credit"
                    : "debit";
            }

            row.appendChild(cell);
        });

        recordsTable.appendChild(row);
    });
}

if (recordForm) {
    recordForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const customer = getCurrentCustomer();

        if (!customer) {
            showMessage("Please log in before making a transaction.", "error");
            return;
        }

        const type = document.getElementById("transactionType").value;
        const amount = Number(document.getElementById("amount").value);

        const description =
            document.getElementById("description").value.trim() ||
            type + " transaction";

        if (type !== "Deposit" && type !== "Withdrawal") {
            showMessage("Please select a transaction type.", "error");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            showMessage("Enter a valid amount greater than zero.", "error");
            return;
        }

        const customers = JSON.parse(
            localStorage.getItem(CUSTOMERS_KEY) || "[]"
        );

        const customerIndex = customers.findIndex(item =>
            item.profile &&
            item.profile.email === customer.profile.email &&
            item.profile.accountNumber === customer.profile.accountNumber
        );

        if (customerIndex === -1) {
            showMessage("Customer account could not be found.", "error");
            return;
        }

        const bankData = customers[customerIndex].bankData;

        if (!Array.isArray(bankData.records)) {
            bankData.records = [];
        }

        if (!Array.isArray(bankData.transactions)) {
            bankData.transactions = [];
        }

        const currentBalance = Number(bankData.balance) || 0;

        if (type === "Withdrawal" && amount > currentBalance) {
            showMessage("Insufficient account balance.", "error");
            return;
        }

        if (type === "Deposit") {
            bankData.balance = currentBalance + amount;
        } else {
            bankData.balance = currentBalance - amount;
        }

        const now = new Date();
        const reference = "DBS" + now.getTime();
        const date = now.toLocaleString("en-NG");

        const record = {
            date,
            reference,
            type,
            description,
            amount,
            status: "Demo Recorded"
        };

        bankData.records.unshift(record);

        bankData.transactions.unshift({
            date,
            reference,
            type,
            description,
            amount,
            status: "Demo Recorded"
        });

        saveCustomers(customers);

        updateBalance();
        renderRecords();

        recordForm.reset();

        showMessage(
            type + " recorded successfully.",
            "success"
        );
    });
}

updateBalance();
renderRecords();
