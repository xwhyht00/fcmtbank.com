
const STORAGE_KEY = "dbsDemoData";

function getBankData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
    }).format(Number(amount) || 0);
}

function updateBalance() {

    const data = getBankData();

    // Fictional starting balance
    const balance = Number(data.balance ?? 250000);

    document.getElementById("availableBalance").textContent =
        formatCurrency(balance);

    const records = data.records || [];
    const transactions = data.transactions || [];

    const deposits = records
        .filter(item => item.type === "Deposit")
        .reduce((total, item) => total + Number(item.amount), 0);

    const withdrawals = records
        .filter(item => item.type === "Withdrawal")
        .reduce((total, item) => total + Number(item.amount), 0);

    const transfers = transactions
        .filter(item => item.type === "Transfer")
        .reduce((total, item) => total + Number(item.amount), 0);

    document.getElementById("totalDeposits").textContent =
        formatCurrency(deposits);

    document.getElementById("totalWithdrawals").textContent =
        formatCurrency(withdrawals);

    document.getElementById("totalTransfers").textContent =
        formatCurrency(transfers);
}

updateBalance();

// Refresh displayed figures when returning to this page
window.addEventListener("pageshow", updateBalance);
