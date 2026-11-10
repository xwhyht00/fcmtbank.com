
document.addEventListener("DOMContentLoaded", function () {
    function readStorage(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallback;
        } catch (error) {
            return fallback;
        }
    }

    const session = readStorage("dbsDemoSession", null);
    const customers = readStorage("dbsDemoCustomers", []);

    if (!session || !Array.isArray(customers)) {
        window.location.replace("login.html");
        return;
    }

    const customer = customers.find(item =>
        item.profile.email === session.email &&
        item.profile.accountNumber === session.accountNumber
    );

    if (!customer) {
        sessionStorage.removeItem("dbsDemoSession");
        window.location.replace("login.html");
        return;
    }

    const profile = customer.profile;
    const bankData = customer.bankData;
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
        accountNumber.textContent = profile.accountNumber;
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

                const description = document.createElement("td");
                const type = document.createElement("td");
                const amount = document.createElement("td");
                const date = document.createElement("td");

                description.textContent =
                    transaction.description || "Account transaction";

                type.textContent = transaction.type || "Transaction";

                amount.textContent = Number(transaction.amount || 0)
                    .toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN"
                    });

                date.textContent = transaction.date
                    ? new Date(transaction.date).toLocaleDateString("en-NG")
                    : "Date unavailable";

                row.append(description, type, amount, date);
                recentTransactions.appendChild(row);
            });
        }
    }
});
