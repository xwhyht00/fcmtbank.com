
const STORAGE_KEY = "dbsDemoData";

function getData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            balance: 250000,
            beneficiaries: [],
            transactions: []
        };
    } catch {
        return {
            balance: 250000,
            beneficiaries: [],
            transactions: []
        };
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function currency(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
    }).format(amount);
}

const form = document.getElementById("transferForm");
const beneficiary = document.getElementById("beneficiary");
const accountNumber = document.getElementById("accountNumber");
const bankName = document.getElementById("bankName");
const amount = document.getElementById("amount");
const narration = document.getElementById("narration");
const confirmation = document.getElementById("confirmation");
const message = document.getElementById("message");

let pendingTransfer = null;

function loadBeneficiaries() {
    const data = getData();

    beneficiary.innerHTML =
        '<option value="">Select Beneficiary</option>';

    data.beneficiaries.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.name + " - " + item.account;
        beneficiary.appendChild(option);
    });

    document.getElementById("currentBalance").textContent =
        currency(data.balance ?? 250000);
}

beneficiary.addEventListener("change", function() {
    const data = getData();
    const selected = data.beneficiaries[Number(this.value)];

    if (selected) {
        accountNumber.value = selected.account;
    }
});

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const data = getData();
    const value = Number(amount.value);
    const account = accountNumber.value.trim();

    if (!account || !Number.isFinite(value) || value <= 0) {
        message.textContent = "Enter valid transfer details.";
        return;
    }

    if (value > Number(data.balance ?? 250000)) {
        message.textContent = "Insufficient demo balance.";
        return;
    }

    pendingTransfer = {
        account: account,
        bank: bankName.value.trim(),
        amount: value,
        narration: narration.value.trim()
    };

    document.getElementById("confirmationDetails").textContent =
        `Account: ${pendingTransfer.account} | Bank: ${pendingTransfer.bank} | Amount: ${currency(value)} | Narration: ${pendingTransfer.narration}`;

    confirmation.hidden = false;
    message.textContent = "Review the details before confirming.";
});

document.getElementById("confirmTransfer")
    .addEventListener("click", function() {

        if (!pendingTransfer) return;

        const data = getData();

        if (pendingTransfer.amount > Number(data.balance ?? 250000)) {
            message.textContent = "Insufficient demo balance.";
            confirmation.hidden = true;
            pendingTransfer = null;
            return;
        }

        data.balance -= pendingTransfer.amount;

        data.transactions = data.transactions || [];

        data.transactions.unshift({
            type: "Transfer",
            amount: pendingTransfer.amount,
            detail: "To account " + pendingTransfer.account,
            date: new Date().toLocaleString(),
            narration: pendingTransfer.narration,
            reference: "DEMO-" + Date.now()
        });

        saveData(data);

        document.getElementById("currentBalance").textContent =
            currency(data.balance);

        confirmation.hidden = true;
        form.reset();
        pendingTransfer = null;

        message.textContent =
            "Demo transfer recorded successfully. No real money was sent.";
    });

document.getElementById("cancelTransfer")
    .addEventListener("click", function() {

        pendingTransfer = null;
        confirmation.hidden = true;

        message.textContent = "Demo transfer cancelled.";
    });

loadBeneficiaries();
