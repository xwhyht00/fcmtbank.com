
document.addEventListener("DOMContentLoaded", function () {
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "DBSadmin123!";

    const loginSection = document.getElementById("loginSection");
    const adminPanel = document.getElementById("adminPanel");

    const loginForm = document.getElementById("adminLoginForm");
    const searchForm = document.getElementById("searchForm");
    const depositForm = document.getElementById("depositForm");

    const loginMessage = document.getElementById("loginMessage");
    const searchMessage = document.getElementById("searchMessage");
    const depositMessage = document.getElementById("depositMessage");

    const customerDetails = document.getElementById("customerDetails");
    const depositHistory = document.getElementById("depositHistory");

    const accountInput = document.getElementById("accountNumber");
    const amountInput = document.getElementById("depositAmount");
    const descriptionInput = document.getElementById("depositDescription");
    const depositButton = document.getElementById("depositButton");

    let selectedAccountNumber = "";

    document.getElementById("year").textContent =
        new Date().getFullYear();

    function readStorage(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function money(amount) {
        return Number(amount || 0).toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN"
        });
    }

    function showMessage(element, message, success = false) {
        element.textContent = message;
        element.style.color = success ? "#147044" : "#b42318";
    }

    function getCustomer() {
        const profile = readStorage("dbsDemoProfile", null);
        const bankData = readStorage("dbsDemoData", null);
        const credentials = readStorage("dbsDemoCredentials", null);

        if (!profile || !bankData || !credentials) {
            return null;
        }

        return {
            profile: profile,
            bankData: bankData,
            accountNumber: String(
                bankData.accountNumber || "0123456789"
            )
        };
    }

    function showCustomer(customer) {
        document.getElementById("customerName").textContent =
            customer.profile.name || "Customer";

        document.getElementById("customerEmail").textContent =
            customer.profile.email || "Not available";

        document.getElementById("displayAccountNumber").textContent =
            customer.accountNumber;

        document.getElementById("customerBalance").textContent =
            money(customer.bankData.balance);

        customerDetails.hidden = false;
    }

    function loadDepositHistory() {
        const deposits = readStorage("dbsAdminDeposits", []);

        depositHistory.replaceChildren();

        if (!Array.isArray(deposits) || deposits.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "empty-row";
            cell.textContent = "No deposits recorded yet.";

            row.appendChild(cell);
            depositHistory.appendChild(row);
            return;
        }

        deposits.slice(0, 20).forEach(function (deposit) {
            const row = document.createElement("tr");

            [
                deposit.reference,
                deposit.accountNumber,
                money(deposit.amount),
                new Date(deposit.date).toLocaleString("en-NG")
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            depositHistory.appendChild(row);
        });
    }

    function openAdminPanel() {
        loginSection.hidden = true;
        adminPanel.hidden = false;
        loadDepositHistory();
    }

    // Keep the admin login active for this browser tab.
    if (sessionStorage.getItem("dbsAdminSession") === "active") {
        openAdminPanel();
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username =
            document.getElementById("adminUsername").value.trim();

        const password =
            document.getElementById("adminPassword").value;

        if (
            username === ADMIN_USERNAME &&
            password === ADMIN_PASSWORD
        ) {
            sessionStorage.setItem("dbsAdminSession", "active");
            showMessage(loginMessage, "Login successful.", true);
            openAdminPanel();
        } else {
            showMessage(loginMessage, "Incorrect administrator username or password.");
        }
    });

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        customerDetails.hidden = true;
        selectedAccountNumber = "";

        const enteredNumber = accountInput.value.trim();

        if (!enteredNumber) {
            showMessage(searchMessage, "Enter an account number.");
            return;
        }

        const customer = getCustomer();

        if (!customer) {
            showMessage(
                searchMessage,
                "No registered customer was found in this browser."
            );
            return;
        }

        if (enteredNumber !== customer.accountNumber) {
            showMessage(
                searchMessage,
                "No customer account matches that number."
            );
            return;
        }

        selectedAccountNumber = customer.accountNumber;
        showCustomer(customer);

        showMessage(searchMessage, "Customer account found.", true);
        showMessage(depositMessage, "");
    });

    depositForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!selectedAccountNumber) {
            showMessage(depositMessage, "Find a customer account first.");
            return;
        }

        const amount = Number(amountInput.value);

        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            amount > 1000000000
        ) {
            showMessage(
                depositMessage,
                "Enter a valid amount between ₦1 and ₦1,000,000,000."
            );
            return;
        }

        const customer = getCustomer();

        if (
            !customer ||
            customer.accountNumber !== selectedAccountNumber
        ) {
            showMessage(
                depositMessage,
                "The customer account could not be verified. Search again."
            );
            customerDetails.hidden = true;
            selectedAccountNumber = "";
            return;
        }

        const bankData = customer.bankData;

        const currentBalance = Number(bankData.balance || 0);

        if (
            !Number.isFinite(currentBalance) ||
            currentBalance < 0
        ) {
            showMessage(depositMessage, "The stored account balance is invalid.");
            return;
        }

        const newBalance = currentBalance + amount;

        if (!Number.isFinite(newBalance)) {
            showMessage(depositMessage, "The new balance is too large.");
            return;
        }

        const now = new Date().toISOString();

        const reference = "DBS-TEST-" +
            Date.now().toString() +
            "-" +
            Math.random().toString(36).slice(2, 7).toUpperCase();

        const description =
            descriptionInput.value.trim() || "Admin test deposit";

        const transaction = {
            reference: reference,
            accountNumber: selectedAccountNumber,
            description: description,
            type: "Admin Deposit",
            amount: amount,
            date: now
        };

        // Update the customer's test balance.
        bankData.balance = newBalance;

        if (!Array.isArray(bankData.transactions)) {
            bankData.transactions = [];
        }

        if (!Array.isArray(bankData.records)) {
            bankData.records = [];
        }

        bankData.transactions.unshift(transaction);
        bankData.records.unshift(transaction);

        const deposits = readStorage("dbsAdminDeposits", []);

        deposits.unshift(transaction);

        try {
            localStorage.setItem(
                "dbsDemoData",
                JSON.stringify(bankData)
            );

            localStorage.setItem(
                "dbsAdminDeposits",
                JSON.stringify(deposits)
            );

            document.getElementById("customerBalance").textContent =
                money(newBalance);

            showMessage(
                depositMessage,
                "Test deposit successful. Reference: " + reference,
                true
            );

            amountInput.value = "";
            descriptionInput.value = "";

            loadDepositHistory();

        } catch (error) {
            console.error(error);

            showMessage(
                depositMessage,
                "Could not save the deposit. Please try again."
            );
        }
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        sessionStorage.removeItem("dbsAdminSession");
        window.location.reload();
    });
});
