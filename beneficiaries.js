
const STORAGE_KEY = "dbsDemoData";

const beneficiaryForm = document.getElementById("beneficiaryForm");
const beneficiaryList = document.getElementById("beneficiaryList");
const message = document.getElementById("message");

function getData() {
    try {
        const savedData = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        const data = savedData && typeof savedData === "object"
            ? savedData
            : {};

        if (!Array.isArray(data.beneficiaries)) {
            data.beneficiaries = [];
        }

        if (!Array.isArray(data.transactions)) {
            data.transactions = [];
        }

        if (!Array.isArray(data.records)) {
            data.records = [];
        }

        if (typeof data.balance !== "number") {
            data.balance = 250000;
        }

        return data;

    } catch (error) {
        return {
            balance: 250000,
            beneficiaries: [],
            transactions: [],
            records: []
        };
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function renderBeneficiaries() {
    const data = getData();

    beneficiaryList.innerHTML = "";

    if (data.beneficiaries.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No beneficiaries saved yet.";
        beneficiaryList.appendChild(empty);
        return;
    }

    data.beneficiaries.forEach((beneficiary, index) => {
        const card = document.createElement("div");
        card.className = "beneficiary-card";

        const info = document.createElement("div");
        info.className = "beneficiary-info";

        const name = document.createElement("h3");
        name.textContent = beneficiary.name;

        const account = document.createElement("p");
        account.textContent = "Account Number: " + beneficiary.account;

        const bank = document.createElement("p");
        bank.textContent = "Bank: " + (beneficiary.bank || "Not specified");

        info.appendChild(name);
        info.appendChild(account);
        info.appendChild(bank);

        const removeButton = document.createElement("button");
        removeButton.className = "remove-btn";
        removeButton.textContent = "Remove";
        removeButton.type = "button";
        removeButton.dataset.index = index;

        card.appendChild(info);
        card.appendChild(removeButton);

        beneficiaryList.appendChild(card);
    });
}

beneficiaryForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document
        .getElementById("beneficiaryName")
        .value.trim();

    const account = document
        .getElementById("beneficiaryAccount")
        .value.trim();

    const bank = document
        .getElementById("beneficiaryBank")
        .value.trim();

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

    const data = getData();

    const duplicate = data.beneficiaries.some(function(item) {
        return item.account === account;
    });

    if (duplicate) {
        showMessage(
            "This account number is already saved.",
            "error"
        );
        return;
    }

    data.beneficiaries.push({
        name: name,
        account: account,
        bank: bank
    });

    saveData(data);

    beneficiaryForm.reset();

    showMessage(
        "Demo beneficiary saved successfully.",
        "success"
    );

    renderBeneficiaries();
});

beneficiaryList.addEventListener("click", function(event) {
    if (!event.target.classList.contains("remove-btn")) {
        return;
    }

    const index = Number(event.target.dataset.index);

    const data = getData();

    if (!Number.isInteger(index) ||
        index < 0 ||
        index >= data.beneficiaries.length) {
        return;
    }

    data.beneficiaries.splice(index, 1);

    saveData(data);
    renderBeneficiaries();

    showMessage(
        "Demo beneficiary removed.",
        "success"
    );
});

renderBeneficiaries();
