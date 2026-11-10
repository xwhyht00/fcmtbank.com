
document.addEventListener("DOMContentLoaded", function () {
    const profile = JSON.parse(
        localStorage.getItem("dbsDemoProfile") || "{}"
    );

    const bankData = JSON.parse(
        localStorage.getItem("dbsDemoData") || "{}"
    );

    const customerName = document.getElementById("customerName");
    const accountBalance = document.getElementById("accountBalance");
    const accountNumber = document.getElementById("accountNumber");
    const transactionCount = document.getElementById("transactionCount");
    const recentTransactions = document.getElementById("recentTransactions");
    const currentYear = document.getElementById("currentYear");

    const transactions = Array.isArray(bankData.transactions)
        ? bankData.transactions
        : [];

    const name = profile.name || "Customer";
    const balance = Number(bankData.balance || 0);
    const number = bankData.accountNumber || "0123456789";

    customerName.textContent = name;

    accountBalance.textContent = balance.toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN"
    });

    accountNumber.textContent = number;
    transactionCount.textContent = transactions.length;

    currentYear.textContent = new Date().getFullYear();

    recentTransactions.innerHTML = "";

    if (transactions.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty-message";
        cell.textContent = "No transactions available.";

        row.appendChild(cell);
        recentTransactions.appendChild(row);
        return;
    }

    transactions.slice(0, 5).forEach(function (transaction) {
        const row = document.createElement("tr");

        const descriptionCell = document.createElement("td");
        const typeCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const dateCell = document.createElement("td");

        descriptionCell.textContent =
            transaction.description || transaction.name || "Account transaction";

        typeCell.textContent = transaction.type || "Transaction";

        const amount = Number(transaction.amount || 0);

        amountCell.textContent = amount.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN"
        });

        dateCell.textContent = transaction.date
            ? new Date(transaction.date).toLocaleDateString("en-NG")
            : "Date unavailable";

        row.appendChild(descriptionCell);
        row.appendChild(typeCell);
        row.appendChild(amountCell);
        row.appendChild(dateCell);

        recentTransactions.appendChild(row);
    });
});
