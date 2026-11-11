
// DBS-BANK: Customer Transaction History

function readStorage(storage, key, fallback) {
    try {
        return JSON.parse(storage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    });
}

function getCurrentCustomer() {
    const session = readStorage(
        sessionStorage,
        "dbsDemoSession",
        null
    );

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    const customers = readStorage(
        localStorage,
        "dbsDemoCustomers",
        []
    );

    const customer = customers.find(item =>
        item.profile &&
        item.profile.email === session.email &&
        item.profile.accountNumber === session.accountNumber
    );

    if (!customer) {
        sessionStorage.removeItem("dbsDemoSession");
        window.location.href = "login.html";
        return null;
    }

    return customer;
}

function getTransactionType(transaction) {
    return String(
        transaction.type ||
        transaction.description ||
        "Transaction"
    );
}

function renderTransactions() {
    const customer = getCurrentCustomer();
    if (!customer) return;

    const data = customer.bankData || {};
    const transactions = Array.isArray(data.transactions)
        ? data.transactions
        : [];

    const records = Array.isArray(data.records)
        ? data.records
        : [];

    const allTransactions = [...transactions];

    // Include deposit and withdrawal records not already listed
    records.forEach(record => {
        if (!allTransactions.some(item =>
            item.reference &&
            item.reference === record.reference
        )) {
            allTransactions.push(record);
        }
    });

    allTransactions.sort((a, b) => {
        return new Date(b.date || 0) - new Date(a.date || 0);
    });

    const transactionTable =
        document.getElementById("transactionTable");

    const emptyMessage =
        document.getElementById("emptyMessage");

    transactionTable.replaceChildren();

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    allTransactions.forEach(transaction => {
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
        allTransactions.length;

    document.getElementById("totalDeposits").textContent =
        formatMoney(totalDeposits);

    document.getElementById("totalWithdrawals").textContent =
        formatMoney(totalWithdrawals);

    if (allTransactions.length === 0) {
        emptyMessage.hidden = false;

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No transactions recorded yet.";

        row.appendChild(cell);
        transactionTable.appendChild(row);
        return;
    }

    emptyMessage.hidden = true;

    allTransactions.forEach(transaction => {
        const row = document.createElement("tr");

        const type = getTransactionType(transaction);
        const typeLower = type.toLowerCase();
        const amount = Number(transaction.amount) || 0;

        const isCredit =
            typeLower.includes("deposit") ||
            typeLower.includes("credit");

        const amountClass = isCredit
            ? "amount-credit"
            : "amount-debit";

        const sign = isCredit ? "+" : "-";

        const date = transaction.date
            ? new Date(transaction.date).toLocaleString("en-NG")
            : "Date unavailable";

        const reference =
            transaction.reference || "Test transaction";

        const description =
            transaction.detail ||
            transaction.description ||
            transaction.narration ||
            "Account transaction";

        const cells = [
            date,
            reference,
            description,
            type,
            sign + formatMoney(amount)
        ];

        cells.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;

            if (index === 4) {
                cell.className = amountClass;
            }

            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.className = "status";
        status.textContent = "Test Recorded";

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        transactionTable.appendChild(row);
    });
}

const refreshButton = document.getElementById("refreshBtn");

refreshButton.addEventListener("click", renderTransactions);

renderTransactions();

window.addEventListener("pageshow", renderTransactions);
