
// DBS-BANK: Customer Transfer Page
// Supports first-time transfers without a saved beneficiary.

const STORAGE_KEY = "dbsDemoCustomers";
const SESSION_KEY = "dbsDemoSession";

function readStorage(storage, key, fallback) {
    try {
        return JSON.parse(storage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function currency(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function getCurrentCustomer() {
    const session = readStorage(sessionStorage, SESSION_KEY, null);

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    const customers = readStorage(localStorage, STORAGE_KEY, []);

    const index = customers.findIndex(customer =>
        customer.profile &&
        customer.profile.email === session.email &&
        customer.profile.accountNumber === session.accountNumber
    );

    if (index === -1) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = "login.html";
        return null;
    }

    return {
        customers,
        index,
        customer: customers[index]
    };
}

const form = document.getElementById("transferForm");
const beneficiary = document.getElementById("beneficiary");
const accountNumber = document.getElementById("accountNumber");
const bankName = document.getElementById("bankName");
const amount = document.getElementById("amount");
const narration = document.getElementById("narration");
const confirmation = document.getElementById("confirmation");
const message = document.getElementById("message");
const currentBalance = document.getElementById("currentBalance");

const confirmationDetails =
    document.getElementById("confirmationDetails");

const confirmButton =
    document.getElementById("confirmTransfer");

const cancelButton =
    document.getElementById("cancelTransfer");

let pendingTransfer = null;

function showMessage(text, type = "") {
    if (!message) return;

    message.textContent = text;
    message.className = type ? "message " + type : "message";
}

function saveCustomers(customers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

function loadBeneficiaries() {
    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const beneficiaries = Array.isArray(data.beneficiaries)
        ? data.beneficiaries
        : [];

    beneficiary.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "Select saved beneficiary (optional)";
    beneficiary.appendChild(firstOption);

    beneficiaries.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = String(index);

        option.textContent =
            (item.name || "Beneficiary") +
            " - " +
            (item.account || item.accountNumber || "");

        beneficiary.appendChild(option);
    });

    if (currentBalance) {
        currentBalance.textContent = currency(data.balance);
    }
}

beneficiary.addEventListener("change", function() {
    const result = getCurrentCustomer();
    if (!result) return;

    const beneficiaries =
        result.customer.bankData.beneficiaries || [];

    if (this.value === "") return;

    const selected = beneficiaries[Number(this.value)];

    if (!selected) return;

    accountNumber.value =
        selected.account || selected.accountNumber || "";

    bankName.value = selected.bank || "";

    showMessage("Saved beneficiary selected.", "success");
});

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};

    const selectedIndex = beneficiary.value;
    const beneficiaries = Array.isArray(data.beneficiaries)
        ? data.beneficiaries
        : [];

    let recipientAccount = accountNumber.value.trim();
    let recipientBank = bankName.value.trim();
    let recipientName = "";

    // Use saved beneficiary details when one is selected.
    if (selectedIndex !== "") {
        const selected = beneficiaries[Number(selectedIndex)];

        if (!selected) {
            showMessage("Please select a valid beneficiary.", "error");
            return;
        }

        recipientAccount =
            selected.account || selected.accountNumber || "";

        recipientBank = selected.bank || "";
        recipientName = selected.name || "";
    }

    const transferAmount = Number(amount.value);

    if (!/^[0-9]{6,20}$/.test(recipientAccount)) {
        showMessage("Enter a valid recipient account number.", "error");
        return;
    }

    if (!recipientBank) {
        showMessage("Enter the recipient's bank name.", "error");
        return;
    }

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
        showMessage("Enter a valid transfer amount.", "error");
        return;
    }

    if (recipientAccount === result.customer.profile.accountNumber) {
        showMessage("You cannot transfer to your own account.", "error");
        return;
    }

    const balance = Number(data.balance) || 0;

    if (transferAmount > balance) {
        showMessage("Insufficient available balance.", "error");
        return;
    }

    pendingTransfer = {
        account: recipientAccount,
        bank: recipientBank,
        name: recipientName,
        amount: transferAmount,
        narration: narration.value.trim()
    };

    confirmationDetails.textContent =
        "Recipient: " + (recipientName || "New recipient") +
        " | Account: " + recipientAccount +
        " | Bank: " + recipientBank +
        " | Amount: " + currency(transferAmount) +
        " | Narration: " + pendingTransfer.narration;

    confirmation.hidden = false;

    showMessage("Please review and confirm your transfer.");
});

confirmButton.addEventListener("click", function() {
    if (!pendingTransfer) return;

    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const balance = Number(data.balance) || 0;

    if (pendingTransfer.amount > balance) {
        showMessage("Insufficient available balance.", "error");
        confirmation.hidden = true;
        pendingTransfer = null;
        return;
    }

    if (!Array.isArray(data.transactions)) {
        data.transactions = [];
    }

    if (!Array.isArray(data.beneficiaries)) {
        data.beneficiaries = [];
    }

    // Save the simulated transfer.
    data.balance = balance - pendingTransfer.amount;

    const reference = "TEST-" + Date.now();
    const date = new Date().toLocaleString("en-NG");

    data.transactions.unshift({
        type: "Transfer",
        amount: pendingTransfer.amount,
        detail: "To account " + pendingTransfer.account,
        description: "Transfer to " + pendingTransfer.account,
        date,
        narration: pendingTransfer.narration,
        reference,
        status: "Demo Recorded"
    });

    // Automatically save a new recipient after the first transfer.
    const alreadySaved = data.beneficiaries.some(item =>
        (item.account || item.accountNumber) === pendingTransfer.account
    );

    if (!alreadySaved) {
        data.beneficiaries.push({
            name: pendingTransfer.name ||
                "Recipient " + pendingTransfer.account.slice(-4),
            account: pendingTransfer.account,
            bank: pendingTransfer.bank
        });
    }

    result.customer.bankData = data;
    result.customers[result.index] = result.customer;

    saveCustomers(result.customers);

    if (currentBalance) {
        currentBalance.textContent = currency(data.balance);
    }

    confirmation.hidden = true;
    form.reset();
    pendingTransfer = null;

    loadBeneficiaries();

    showMessage(
        "Test transfer recorded. The recipient has been saved to your beneficiaries. No real money was sent.",
        "success"
    );
});

cancelButton.addEventListener("click", function() {
    pendingTransfer = null;
    confirmation.hidden = true;
    showMessage("Transfer cancelled.");
});

loadBeneficiaries();

window.addEventListener("pageshow", loadBeneficiaries);
