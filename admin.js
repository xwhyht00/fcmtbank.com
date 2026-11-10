
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

    function getCustomers() {
        let customers = readStorage("dbsDemoCustomers", null);

        if (Array.isArray(customers)) return customers;

        customers = [];

        const profile = readStorage("dbsDemoProfile", null);
        const credentials = readStorage("dbsDemoCredentials", null);
        const bankData = readStorage("dbsDemoData", null);

        if (profile && credentials && bankData) {
            const accountNumber = bankData.accountNumber || "0123456789";

            customers.push({
                profile: { ...profile, accountNumber: accountNumber },
                credentials: credentials,
                bankData: { ...bankData, accountNumber: accountNumber }
            });

            localStorage.setItem(
                "dbsDemoCustomers",
                JSON.stringify(customers)
            );
        }

        return customers;
    }

    function money(amount) {
        return Number(amount || 0).toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN"
        });
    }

    function showMessage(element, text, success = false) {
        element.textContent = text;
        element.style.color = success ? "#147044" : "#b42318";
    }

    function showCustomer(customer) {
        document.getElementById("customerName").textContent =
            customer.profile.name || "Customer";

        document.getElementById("customerEmail").textContent =
            customer.profile.email || "Not available";

        document.getElementById("displayAccountNumber").textContent =
            customer.profile.accountNumber;

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

        deposits.slice(0, 30).forEach(function (deposit) {
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
            openAdminPanel();
        } else {
            showMessage(
                loginMessage,
                "Incorrect administrator username or password."
            );
        }
    });

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        customerDetails.hidden = true;
        selectedAccountNumber = "";

        const enteredNumber =
            document.getElementById("accountNumber").value.trim();

        if (!enteredNumber) {
            showMessage(searchMessage, "Enter an account number.");
            return;
        }

        const customers = getCustomers();

        const customer = customers.find(item =>
            item.profile.accountNumber === enteredNumber
        );

        if (!customer) {
            showMessage(
                searchMessage,
                "No customer account matches that number."
            );
            return;
        }

        selectedAccountNumber = enteredNumber;
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

        const amount = Number(
            document.getElementById("depositAmount").value
        );

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

        const customers = getCustomers();

        const customerIndex = customers.findIndex(item =>
            item.profile.accountNumber === selectedAccountNumber
        );

        if (customerIndex === -1) {
            showMessage(depositMessage, "Customer account not found. Search again.");
            customerDetails.hidden = true;
            selectedAccountNumber = "";
            return;
        }

        const customer = customers[customerIndex];
        const currentBalance = Number(customer.bankData.balance || 0);
        const newBalance = currentBalance + amount;

        if (
            !Number.isFinite(currentBalance) ||
            currentBalance < 0 ||
            !Number.isFinite(newBalance)
        ) {
            showMessage(depositMessage, "The account balance is invalid.");
            return;
        }

        const date = new Date().toISOString();

        const reference = "DBS-TEST-" +
            Date.now() + "-" +
            Math.random().toString(36).slice(2, 7).toUpperCase();

        const description =
            document.getElementById("depositDescription").value.trim() ||
            "Admin test deposit";

        const transaction = {
            reference: reference,
            accountNumber: selectedAccountNumber,
            description: description,
            type: "Admin Deposit",
            amount: amount,
            date: date
        };

        if (!Array.isArray(customer.bankData.transactions)) {
            customer.bankData.transactions = [];
        }

        if (!Array.isArray(customer.bankData.records)) {
            customer.bankData.records = [];
        }

        customer.bankData.balance = newBalance;
        customer.bankData.transactions.unshift(transaction);
        customer.bankData.records.unshift(transaction);

        const deposits = readStorage("dbsAdminDeposits", []);
        deposits.unshift(transaction);

        try {
            // Save all customers, including the updated selected account.
            localStorage.setItem(
                "dbsDemoCustomers",
                JSON.stringify(customers)
            );

            localStorage.setItem(
                "dbsAdminDeposits",
                JSON.stringify(deposits)
            );

            showCustomer(customer);

            showMessage(
                depositMessage,
                "Test deposit successful. Reference: " + reference,
                true
            );

            document.getElementById("depositAmount").value = "";
            document.getElementById("depositDescription").value = "";

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
