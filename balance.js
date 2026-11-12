
document.addEventListener("DOMContentLoaded", function () {

    const CUSTOMERS_KEY = "dbsDemoCustomers";
    const SESSION_KEY = "dbsDemoSession";

    function readStorage(storage, key, fallback) {
        try {
            const value = JSON.parse(storage.getItem(key));
            return value ?? fallback;
        } catch (error) {
            return fallback;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    function getAmount(item) {
        return Number(item?.amount) || 0;
    }

    function getType(item) {
        return String(item?.type || "").toLowerCase();
    }

    function updateBalance() {

        // Get the current demo session.
        const session = readStorage(
            sessionStorage,
            SESSION_KEY,
            null
        );

        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // Get registered demo customers.
        const customers = readStorage(
            localStorage,
            CUSTOMERS_KEY,
            []
        );

        if (!Array.isArray(customers)) {
            window.location.href = "login.html";
            return;
        }

        // Find the logged-in customer.
        const customer = customers.find(function (item) {
            if (!item.profile) return false;

            const emailMatches =
                item.profile.email === session.email;

            const accountMatches =
                !session.accountNumber ||
                item.accountNumber === session.accountNumber ||
                item.profile.accountNumber === session.accountNumber;

            return emailMatches && accountMatches;
        });

        if (!customer) {
            sessionStorage.removeItem(SESSION_KEY);
            window.location.href = "login.html";
            return;
        }

        // Read this customer's simulated banking data.
        const bankData = customer.bankData || {};

        const balance = Number(bankData.balance) || 0;

        const records = Array.isArray(bankData.records)
            ? bankData.records
            : [];

        const transactions = Array.isArray(bankData.transactions)
            ? bankData.transactions
            : [];

        // Calculate demo deposits.
        const deposits = records
            .filter(item => getType(item) === "deposit")
            .reduce((total, item) => total + getAmount(item), 0);

        // Calculate demo withdrawals.
        const withdrawals = records
            .filter(item => getType(item) === "withdrawal")
            .reduce((total, item) => total + getAmount(item), 0);

        // Calculate demo transfers.
        const transfers = transactions
            .filter(item => getType(item) === "transfer")
            .reduce((total, item) => total + getAmount(item), 0);

        // Display the account balance.
        const balanceElement =
            document.getElementById("availableBalance");

        if (balanceElement) {
            balanceElement.textContent = formatCurrency(balance);
        }

        // Display the account number.
        const accountNumberElement =
            document.getElementById("accountNumber");

        if (accountNumberElement) {
            accountNumberElement.textContent =
                customer.accountNumber ||
                customer.profile.accountNumber ||
                "Demo account";
        }

        // Display deposits.
        const depositsElement =
            document.getElementById("totalDeposits");

        if (depositsElement) {
            depositsElement.textContent = formatCurrency(deposits);
        }

        // Display withdrawals.
        const withdrawalsElement =
            document.getElementById("totalWithdrawals");

        if (withdrawalsElement) {
            withdrawalsElement.textContent = formatCurrency(withdrawals);
        }

        // Display transfers.
        const transfersElement =
            document.getElementById("totalTransfers");

        if (transfersElement) {
            transfersElement.textContent = formatCurrency(transfers);
        }

        // Update footer year.
        const yearElement = document.getElementById("currentYear");

        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    updateBalance();

    // Refresh when the user returns to the page.
    window.addEventListener("pageshow", updateBalance);

});
