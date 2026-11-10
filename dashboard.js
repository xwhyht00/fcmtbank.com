
document.addEventListener("DOMContentLoaded", function () {
    function readStorage(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallback;
        } catch (error) {
            return fallback;
        }
    }

    const session = readStorage("dbsDemoSession", null);
    const profile = readStorage("dbsDemoProfile", {});
    const credentials = readStorage("dbsDemoCredentials", null);

    // Require a matching browser session before showing the dashboard.
    if (
        !session ||
        !credentials ||
        !profile.email ||
        session.email !== profile.email ||
        session.email !== credentials.email
    ) {
        window.location.replace("login.html");
        return;
    }

    const bankData = readStorage("dbsDemoData", {});
    const transactions = Array.isArray(bankData.transactions)
        ? bankData.transactions
        : [];

    const customerName = document.getElementById("customerName");
    const accountBalance = document.getElementById("accountBalance");
    const accountNumber = document.getElementById("accountNumber");
    const transactionCount = document.getElementById("transactionCount");
    const recentTransactions = document.getElementById("recentTransactions");
    const currentYear = document.getElementById("currentYear");

    if (customerName) {
        customerName.textContent = profile.name || "Customer";
    }

    if (accountBalance) {
        accountBalance.textContent = Number(bankData.balance || 0)
            .toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN"
            });
    }

    if (accountNumber) {
        accountNumber.textContent = bankData.accountNumber || "0123456789";
    }

    if (transactionCount) {
        transactionCount.textContent = transactions.length;
    }

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    if (recentTransactions) {
        recentTransactions.replaceChildren();

        if (transactions.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "empty-message";
            cell.textContent = "No transactions available.";

            row.appendChild(cell);
            recentTransactions.appendChild(row);
        } else {
            transactions.slice(0, 5).forEach(function (transaction) {
                const row = document.createElement("tr");

                const descriptionCell = document.createElement("td");
                const typeCell = document.createElement("td");
                const amountCell = document.createElement("td");
                const dateCell = document.createElement("td");

                descriptionCell.textContent =
                    transaction.description ||
                    transaction.name ||
                    "Account transaction";

                typeCell.textContent = transaction.type || "Transaction";

                amountCell.textContent = Number(transaction.amount || 0)
                    .toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN"
                    });

                dateCell.textContent = transaction.date
                    ? new Date(transaction.date).toLocaleDateString("en-NG")
                    : "Date unavailable";

                row.append(
                    descriptionCell,
                    typeCell,
                    amountCell,
                    dateCell
                );

                recentTransactions.appendChild(row);
            });
        }
    }
});
