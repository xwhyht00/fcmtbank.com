
// DBS-BANK: Customer Beneficiary Management

function readStorage(storage, key, fallback) {
    try {
        return JSON.parse(storage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

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

    return {
        customers,
        index,
        customer: customers[index]
    };
}

const beneficiaryForm =
    document.getElementById("beneficiaryForm");

const beneficiaryList =
    document.getElementById("beneficiaryList");

const message =
    document.getElementById("message");

function saveCustomers(customers) {
    localStorage.setItem(
        "dbsDemoCustomers",
        JSON.stringify(customers)
    );
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function renderBeneficiaries() {
    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const beneficiaries = Array.isArray(data.beneficiaries)
        ? data.beneficiaries
        : [];

    beneficiaryList.replaceChildren();

    if (beneficiaries.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No beneficiaries saved yet.";
        beneficiaryList.appendChild(empty);
        return;
    }

    beneficiaries.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "beneficiary-card";

        const info = document.createElement("div");
        info.className = "beneficiary-info";

        const name = document.createElement("h3");
        name.textContent = item.name || "Beneficiary";

        const account = document.createElement("p");
        account.textContent =
            "Account Number: " + (item.account || item.accountNumber || "");

        const bank = document.createElement("p");
        bank.textContent = "Bank: " + (item.bank || "Not specified");

        info.append(name, account, bank);

        const removeButton = document.createElement("button");
        removeButton.className = "remove-btn";
        removeButton.textContent = "Remove";
        removeButton.type = "button";
        removeButton.dataset.index = index;

        card.append(info, removeButton);
        beneficiaryList.appendChild(card);
    });
}

beneficiaryForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document
        .getElementById("beneficiaryName").value.trim();

    const account = document
        .getElementById("beneficiaryAccount").value.trim();

    const bank = document
        .getElementById("beneficiaryBank").value.trim();

    if (!name || !account || !bank) {
        showMessage("Please complete all fields.", "error");
        return;
    }

    if (!/^[0-9]{6,20}$/.test(account)) {
        showMessage(
            "Enter an account number containing 6 to 20 digits.",
            "error"
        );
        return;
    }

    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};

    if (!Array.isArray(data.beneficiaries)) {
        data.beneficiaries = [];
    }

    const duplicate = data.beneficiaries.some(item =>
        (item.account || item.accountNumber) === account
    );

    if (duplicate) {
        showMessage(
            "This account number is already saved.",
            "error"
        );
        return;
    }

    data.beneficiaries.push({
        name,
        account,
        bank
    });

    result.customer.bankData = data;
    result.customers[result.index] = result.customer;

    saveCustomers(result.customers);

    beneficiaryForm.reset();

    showMessage(
        "Test beneficiary saved successfully.",
        "success"
    );

    renderBeneficiaries();
});

beneficiaryList.addEventListener("click", function(event) {
    if (!event.target.classList.contains("remove-btn")) {
        return;
    }

    const index = Number(event.target.dataset.index);

    const result = getCurrentCustomer();
    if (!result) return;

    const data = result.customer.bankData || {};
    const beneficiaries = data.beneficiaries || [];

    if (!Number.isInteger(index) ||
        index < 0 ||
        index >= beneficiaries.length) {
        return;
    }

    beneficiaries.splice(index, 1);

    data.beneficiaries = beneficiaries;
    result.customer.bankData = data;
    result.customers[result.index] = result.customer;

    saveCustomers(result.customers);

    renderBeneficiaries();

    showMessage(
        "Test beneficiary removed.",
        "success"
    );
});

renderBeneficiaries();

window.addEventListener("pageshow", renderBeneficiaries);
