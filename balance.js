
function readStorage(storage, key, fallback) {
    try {
        const value = JSON.parse(storage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
    }).format(Number(amount) || 0);
}

function updateBalance() {
    // Get the currently logged-in customer
    const session = readStorage(
        sessionStorage,
        "dbsDemoSession",
        null
    );

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    // Get all registered customers
    const customers = readStorage(
        localStorage,
        "dbsDemoCustomers",
        []
    );

    // Find this customer's own account
    const customer = customers.find(item =>
        item.profile &&
        item.profile.email === session.email &&
        item.profile.accountNumber === session.accountNumber
    );

    if (!customer) {
        sessionStorage.removeItem("dbsDemoSession");
        window.location.href = "login.html";
        return;
    }

    const data = customer.bankData || {};

    const balance = Number(data.balance ?? 0);

    document.getElementById("availableBalance").textContent =
        formatCurrency(balance);

    const records = data.records || [];
    const transactions = data.transactions || [];

    const deposits = records
        .filter(item => item.type === "Deposit")
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    const withdrawals = records
        .filter(item => item.type === "Withdrawal")
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    const transfers = transactions
        .filter(item => item.type === "Transfer")
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    document.getElementById("totalDeposits").textContent =
        formatCurrency(deposits);

    document.getElementById("totalWithdrawals").textContent =
        formatCurrency(withdrawals);

    document.getElementById("totalTransfers").textContent =
        formatCurrency(transfers);
}

updateBalance();

window.addEventListener("pageshow", updateBalance);
