
/* =========================================
   NOVACREST BANK
   BENEFICIARY MANAGEMENT
   Fictional Banking Prototype
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const CUSTOMERS_KEY = "dbsDemoCustomers";
    const SESSION_KEY = "dbsDemoSession";

    const beneficiaryForm =
        document.getElementById("beneficiaryForm");

    const beneficiaryList =
        document.getElementById("beneficiaryList");

    const message =
        document.getElementById("message");

    const nameInput =
        document.getElementById("beneficiaryName");

    const accountInput =
        document.getElementById("beneficiaryAccount");

    const bankInput =
        document.getElementById("beneficiaryBank");

    const yearElement =
        document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (!beneficiaryForm || !beneficiaryList || !message) {
        console.error("Beneficiary page elements are missing.");
        return;
    }

    /* =====================================
       STORAGE HELPERS
    ===================================== */

    function readStorage(storage, key, fallback) {
        try {
            const value = storage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value) ?? fallback;

        } catch (error) {
            console.error("Storage read error:", error);
            return fallback;
        }
    }

    function saveCustomers(customers) {
        try {
            localStorage.setItem(
                CUSTOMERS_KEY,
                JSON.stringify(customers)
            );

            return true;

        } catch (error) {
            console.error("Storage save error:", error);
            return false;
        }
    }

    /* =====================================
       CURRENT CUSTOMER
    ===================================== */

    function getCurrentCustomer() {

        const session = readStorage(
            sessionStorage,
            SESSION_KEY,
            null
        );

        if (!session || !session.email) {
            window.location.href = "login.html";
            return null;
        }

        const customers = readStorage(
            localStorage,
            CUSTOMERS_KEY,
            []
        );

        if (!Array.isArray(customers)) {
            showMessage(
                "Demo customer records could not be loaded.",
                "error"
            );

            return null;
        }

        const index = customers.findIndex(function (customer) {

            if (!customer || !customer.profile) {
                return false;
            }

            const emailMatches =
                customer.profile.email === session.email;

            const customerAccount =
                customer.accountNumber ||
                customer.profile.accountNumber;

            const accountMatches =
                !session.accountNumber ||
                customerAccount === session.accountNumber;

            return emailMatches && accountMatches;
        });

        if (index === -1) {

            sessionStorage.removeItem(SESSION_KEY);

            window.location.href = "login.html";

            return null;
        }

        return {
            customers: customers,
            index: index,
            customer: customers[index]
        };
    }

    /* =====================================
       BANK DATA
    ===================================== */

    function getBankData(customer) {

        if (!customer.bankData ||
            typeof customer.bankData !== "object") {

            customer.bankData = {};
        }

        if (!Array.isArray(customer.bankData.beneficiaries)) {
            customer.bankData.beneficiaries = [];
        }

        if (!Array.isArray(customer.bankData.transactions)) {
            customer.bankData.transactions = [];
        }

        if (!Array.isArray(customer.bankData.records)) {
            customer.bankData.records = [];
        }

        return customer.bankData;
    }

    /* =====================================
       MESSAGE DISPLAY
    ===================================== */

    function showMessage(text, type) {

        message.textContent = text;

        message.className = "message " + type;
    }

    /* =====================================
       RENDER BENEFICIARIES
    ===================================== */

    function renderBeneficiaries() {

        const result = getCurrentCustomer();

        if (!result) {
            return;
        }

        const data = getBankData(result.customer);

        const beneficiaries = data.beneficiaries;

        beneficiaryList.replaceChildren();

        if (beneficiaries.length === 0) {

            const empty = document.createElement("p");

            empty.className = "empty-message";

            empty.textContent =
                "No demonstration beneficiaries have been saved yet.";

            beneficiaryList.appendChild(empty);

            return;
        }

        beneficiaries.forEach(function (item, index) {

            const card = document.createElement("div");

            card.className = "beneficiary-card";

            const info = document.createElement("div");

            info.className = "beneficiary-info";

            const name = document.createElement("h3");

            name.textContent =
                item.name || "Demo Beneficiary";

            const account = document.createElement("p");

            account.textContent =
                "Demo Account Number: " +
                (item.account || item.accountNumber || "");

            const bank = document.createElement("p");

            bank.textContent =
                "Demo Bank: " +
                (item.bank || "Not specified");

            info.append(name, account, bank);

            const removeButton =
                document.createElement("button");

            removeButton.type = "button";

            removeButton.className = "remove-btn";

            removeButton.textContent = "Remove";

            removeButton.dataset.index = String(index);

            removeButton.setAttribute(
                "aria-label",
                "Remove beneficiary " + (item.name || "")
            );

            card.append(info, removeButton);

            beneficiaryList.appendChild(card);
        });
    }

    /* =====================================
       ADD BENEFICIARY
    ===================================== */

    beneficiaryForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = nameInput.value.trim();

        const account = accountInput.value.trim();

        const bank = bankInput.value.trim();

        if (!name || !account || !bank) {

            showMessage(
                "Please complete all fields.",
                "error"
            );

            return;
        }

        if (name.length > 80 || bank.length > 80) {

            showMessage(
                "Name and bank name must not exceed 80 characters.",
                "error"
            );

            return;
        }

        if (!/^[0-9]{6,20}$/.test(account)) {

            showMessage(
                "Enter a fictional account number containing 6 to 20 digits.",
                "error"
            );

            return;
        }

        const result = getCurrentCustomer();

        if (!result) {
            return;
        }

        const data = getBankData(result.customer);

        const duplicate = data.beneficiaries.some(function (item) {

            const savedAccount =
                item.account || item.accountNumber || "";

            return savedAccount === account;
        });

        if (duplicate) {

            showMessage(
                "This demonstration account number is already saved.",
                "error"
            );

            return;
        }

        const newBeneficiary = {
            name: name,
            account: account,
            bank: bank,
            createdAt: new Date().toISOString(),
            demo: true
        };

        data.beneficiaries.push(newBeneficiary);

        result.customer.bankData = data;

        result.customers[result.index] = result.customer;

        if (!saveCustomers(result.customers)) {

            data.beneficiaries.pop();

            showMessage(
                "Unable to save beneficiary data in this browser.",
                "error"
            );

            return;
        }

        beneficiaryForm.reset();

        showMessage(
            "Demonstration beneficiary added successfully.",
            "success"
        );

        renderBeneficiaries();
    });

    /* =====================================
       REMOVE BENEFICIARY
    ===================================== */

    beneficiaryList.addEventListener("click", function (event) {

        const button = event.target.closest(".remove-btn");

        if (!button || !beneficiaryList.contains(button)) {
            return;
        }

        const index = Number(button.dataset.index);

        if (!Number.isInteger(index) || index < 0) {
            return;
        }

        const result = getCurrentCustomer();

        if (!result) {
            return;
        }

        const data = getBankData(result.customer);

        if (index >= data.beneficiaries.length) {
            return;
        }

        const removedBeneficiary =
            data.beneficiaries.splice(index, 1)[0];

        result.customer.bankData = data;

        result.customers[result.index] = result.customer;

        if (!saveCustomers(result.customers)) {

            data.beneficiaries.splice(
                index,
                0,
                removedBeneficiary
            );

            showMessage(
                "Unable to remove beneficiary. Please try again.",
                "error"
            );

            return;
        }

        renderBeneficiaries();

        showMessage(
            "Demonstration beneficiary removed successfully.",
            "success"
        );
    });

    /* =====================================
       PAGE REFRESH
    ===================================== */

    renderBeneficiaries();

    window.addEventListener("pageshow", function () {
        renderBeneficiaries();
    });

});
