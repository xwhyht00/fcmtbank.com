
// DBS-BANK: Customer Transfer Page

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
        currency: "NGN"
    }).format(Number(amount) || 0);
}

// Get the logged-in customer
function getCurrentCustomer() {
    const session = readStorage(
        sessionStorage,
        "dbsDemoSession",
        null
    );

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    const customers = readStorage(
        localStorage,
        "dbsDemoCustomers",
        []
    );

    const index = customers.findIndex(customer =>
        customer.profile &&
        customer.profile.email === session.email &&
        customer.profile.accountNumber === session.accountNumber
    );

    if (index === -1) {
        sessionStorage.removeItem("dbsDemoSession");
        window.location.href = "login.html";
        return null;
    }

    return { customers, index, customer: customers[index] };
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

let pendingTransfer = null;

function saveCustomers(customers) {
    localStorage.setItem(
        "dbsDemoCustomers",
        JSON.stringify(customers)
    );
}

function loadBeneficiaries() {
    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const beneficiaries = data.beneficiaries || [];

    beneficiary.innerHTML =
        '<option value="">Select Beneficiary</option>';

    beneficiaries.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent =
            (item.name || "Beneficiary") + " - " +
            (item.account || item.accountNumber || "");
        beneficiary.appendChild(option);
    });

    currentBalance.textContent =
        currency(data.balance ?? 0);
}

beneficiary.addEventListener("change", function() {
    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const beneficiaries = data.beneficiaries || [];
    const selected = beneficiaries[Number(this.value)];

    if (selected) {
        accountNumber.value =
            selected.account || selected.accountNumber || "";

        if (selected.bank) {
            bankName.value = selected.bank;
        }
    }
});

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const balance = Number(data.balance ?? 0);
    const value = Number(amount.value);
    const account = accountNumber.value.trim();

    message.textContent = "";

    if (!account || !Number.isFinite(value) || value <= 0) {
        message.textContent = "Enter valid transfer details.";
        return;
    }

    if (account === result.customer.profile.accountNumber) {
        message.textContent =
            "You cannot transfer to your own account.";
        return;
    }

    if (value > balance) {
        message.textContent = "Insufficient available balance.";
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
    message.textContent =
        "Review the transfer details before confirming.";
});

document.getElementById("confirmTransfer")
    .addEventListener("click", function() {

        if (!pendingTransfer) return;

        const result = getCurrentCustomer();
        if (!result) return;

        const data = result.customer.bankData || {};
        const balance = Number(data.balance ?? 0);

        if (pendingTransfer.amount > balance) {
            message.textContent = "Insufficient available balance.";
            confirmation.hidden = true;
            pendingTransfer = null;
            return;
        }

        // Deduct from this customer's test balance
        data.balance = balance - pendingTransfer.amount;

        data.transactions = data.transactions || [];

        data.transactions.unshift({
            type: "Transfer",
            amount: pendingTransfer.amount,
            detail: "To account " + pendingTransfer.account,
            date: new Date().toLocaleString(),
            narration: pendingTransfer.narration,
            reference: "TEST-" + Date.now()
        });

        result.customer.bankData = data;
        result.customers[result.index] = result.customer;

        saveCustomers(result.customers);

        currentBalance.textContent = currency(data.balance);

        confirmation.hidden = true;
        form.reset();
        pendingTransfer = null;

        message.textContent =
            "Test transfer recorded successfully. No real money was sent.";
    });

document.getElementById("cancelTransfer")
    .addEventListener("click", function() {

        pendingTransfer = null;
        confirmation.hidden = true;

        message.textContent = "Transfer cancelled.";
    });

loadBeneficiaries();

window.addEventListener("pageshow", loadBeneficiaries);
