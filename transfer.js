
// DBS-BANK: Customer Transfer Page

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

    if (!Array.isArray(data.beneficiaries)) {
        data.beneficiaries = [];
    }

    beneficiary.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Beneficiary";

    beneficiary.appendChild(defaultOption);

    data.beneficiaries.forEach((item, index) => {
        const option = document.createElement("option");

        option.value = String(index);

        option.textContent =
            (item.name || "Beneficiary") +
            " - " +
            (item.account || item.accountNumber || "") +
            " (" +
            (item.bank || "Bank not specified") +
            ")";

        beneficiary.appendChild(option);
    });

    if (currentBalance) {
        currentBalance.textContent = currency(data.balance);
    }

    if (data.beneficiaries.length === 0) {
        showMessage(
            "No beneficiaries saved. Please add a beneficiary first.",
            "error"
        );
    } else {
        showMessage(
            data.beneficiaries.length + " beneficiary(ies) available.",
            "success"
        );
    }
}

beneficiary.addEventListener("change", function() {
    const result = getCurrentCustomer();

    if (!result) return;

    const beneficiaries =
        result.customer.bankData.beneficiaries || [];

    if (this.value === "") {
        accountNumber.value = "";
        bankName.value = "";
        return;
    }

    const selected = beneficiaries[Number(this.value)];

    if (!selected) {
        showMessage("Please select a valid beneficiary.", "error");
        return;
    }

    accountNumber.value =
        selected.account || selected.accountNumber || "";

    bankName.value = selected.bank || "";

    showMessage(
        "Beneficiary details loaded successfully.",
        "success"
    );
});

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const result = getCurrentCustomer();

    if (!result) return;

    const data = result.customer.bankData || {};
    const beneficiaries = data.beneficiaries || [];

    const selectedIndex = beneficiary.value;

    if (selectedIndex === "" ||
        !beneficiaries[Number(selectedIndex)]) {
        showMessage(
            "Please select a beneficiary before continuing.",
            "error"
        );
        return;
    }

    const selected = beneficiaries[Number(selectedIndex)];

    const account =
        selected.account || selected.accountNumber || "";

    const bank = selected.bank || "";

    const balance = Number(data.balance || 0);
    const value = Number(amount.value);

    if (!Number.isFinite(value) || value <= 0) {
        showMessage("Enter a valid transfer amount.", "error");
        return;
    }

    if (account === result.customer.profile.accountNumber) {
        showMessage("You cannot transfer to your own account.", "error");
        return;
    }

    if (value > balance) {
        showMessage("Insufficient available balance.", "error");
        return;
    }

    pendingTransfer = {
        account,
        bank,
        beneficiaryName: selected.name || "Beneficiary",
        amount: value,
        narration: narration.value.trim()
    };

    confirmationDetails.textContent =
        "Beneficiary: " + pendingTransfer.beneficiaryName +
        " | Account: " + account +
        " | Bank: " + bank +
        " | Amount: " + currency(value) +
        " | Narration: " + pendingTransfer.narration;

    confirmation.hidden = false;

    showMessage("Review the transfer details before confirming.");
});

document.getElementById("confirmTransfer")
    .addEventListener("click", function() {

        if (!pendingTransfer) return;

        const result = getCurrentCustomer();

        if (!result) return;

        const data = result.customer.bankData || {};
        const balance = Number(data.balance || 0);

        if (pendingTransfer.amount > balance) {
            showMessage("Insufficient available balance.", "error");
            confirmation.hidden = true;
            pendingTransfer = null;
            return;
        }

        data.balance = balance - pendingTransfer.amount;

        if (!Array.isArray(data.transactions)) {
            data.transactions = [];
        }

        const reference = "TEST-" + Date.now();
        const date = new Date().toLocaleString("en-NG");

        data.transactions.unshift({
            type: "Transfer",
            amount: pendingTransfer.amount,
            detail: "To " + pendingTransfer.beneficiaryName +
                " - " + pendingTransfer.account,
            description: "Transfer to " + pendingTransfer.beneficiaryName,
            date,
            narration: pendingTransfer.narration,
            reference,
            status: "Demo Recorded"
        });

        result.customer.bankData = data;
        result.customers[result.index] = result.customer;

        saveCustomers(result.customers);

        currentBalance.textContent = currency(data.balance);

        confirmation.hidden = true;
        form.reset();
        pendingTransfer = null;

        loadBeneficiaries();

        showMessage(
            "Test transfer recorded successfully. No real money was sent.",
            "success"
        );
    });

document.getElementById("cancelTransfer")
    .addEventListener("click", function() {

        pendingTransfer = null;
        confirmation.hidden = true;

        showMessage("Transfer cancelled.");
    });

loadBeneficiaries();

window.addEventListener("pageshow", loadBeneficiaries);
