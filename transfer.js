
/*
 * NOVACREST BANK
 * Simulated customer transfer system.
 *
 * This is a fictional software prototype.
 * No real money is transferred and no bank is contacted.
 */

document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "dbsDemoCustomers";
    const SESSION_KEY = "dbsDemoSession";

    const form = document.getElementById("transferForm");
    const beneficiarySelect = document.getElementById("beneficiary");
    const accountNumberInput = document.getElementById("accountNumber");
    const bankNameInput = document.getElementById("bankName");
    const amountInput = document.getElementById("amount");
    const narrationInput = document.getElementById("narration");

    const confirmation = document.getElementById("confirmation");
    const confirmationDetails = document.getElementById("confirmationDetails");
    const confirmButton = document.getElementById("confirmTransfer");
    const cancelButton = document.getElementById("cancelTransfer");

    const message = document.getElementById("message");
    const currentBalance = document.getElementById("currentBalance");
    const sourceAccount = document.getElementById("sourceAccount");
    const currentYear = document.getElementById("currentYear");

    let pendingTransfer = null;

    function readStorage(storage, key, fallback) {
        try {
            const value = JSON.parse(storage.getItem(key));
            return value ?? fallback;
        } catch (error) {
            return fallback;
        }
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2
        }).format(Number(value) || 0);
    }

    function showMessage(text, type = "") {
        if (!message) return;

        message.textContent = text;
        message.className = type ? "message " + type : "message";
    }

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
            STORAGE_KEY,
            []
        );

        if (!Array.isArray(customers)) {
            showMessage("Demo customer records could not be loaded.", "error");
            return null;
        }

        const index = customers.findIndex(function (customer) {
            if (!customer || !customer.profile) return false;

            const emailMatches =
                customer.profile.email === session.email;

            const customerAccount =
                customer.accountNumber ||
                customer.profile.accountNumber ||
                "";

            const sessionAccount = session.accountNumber || "";

            const accountMatches =
                !sessionAccount ||
                customerAccount === sessionAccount;

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

    function saveCustomers(customers) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(customers)
            );
            return true;
        } catch (error) {
            showMessage(
                "Unable to save the demo transaction in this browser.",
                "error"
            );
            return false;
        }
    }

    function getBankData(customer) {
        if (!customer.bankData || typeof customer.bankData !== "object") {
            customer.bankData = {};
        }

        const data = customer.bankData;

        if (!Array.isArray(data.beneficiaries)) {
            data.beneficiaries = [];
        }

        if (!Array.isArray(data.transactions)) {
            data.transactions = [];
        }

        if (!Array.isArray(data.records)) {
            data.records = [];
        }

        return data;
    }

    function updateAccountDisplay() {
        const result = getCurrentCustomer();

        if (!result) return;

        const customer = result.customer;
        const data = getBankData(customer);

        const account =
            customer.accountNumber ||
            customer.profile.accountNumber ||
            "Demo account";

        if (sourceAccount) {
            sourceAccount.textContent = account;
        }

        if (currentBalance) {
            currentBalance.textContent = formatCurrency(data.balance);
        }

        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }
    }

    function loadBeneficiaries() {
        if (!beneficiarySelect) return;

        const result = getCurrentCustomer();

        if (!result) return;

        const data = getBankData(result.customer);

        beneficiarySelect.innerHTML = "";

        const firstOption = document.createElement("option");
        firstOption.value = "";
        firstOption.textContent = "Enter a new demo recipient below";

        beneficiarySelect.appendChild(firstOption);

        data.beneficiaries.forEach(function (item, index) {
            const option = document.createElement("option");

            option.value = String(index);

            const recipientAccount =
                item.account || item.accountNumber || "";

            option.textContent =
                (item.name || "Demo Beneficiary") +
                " - " +
                recipientAccount;

            beneficiarySelect.appendChild(option);
        });

        updateAccountDisplay();
    }

    function hideConfirmation() {
        if (confirmation) {
            confirmation.hidden = true;
        }

        pendingTransfer = null;
    }

    function addConfirmationRow(label, value) {
        const row = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = label + ": ";

        row.appendChild(strong);
        row.appendChild(document.createTextNode(value));

        confirmationDetails.appendChild(row);
    }

    // Select an existing demo beneficiary.
    if (beneficiarySelect) {
        beneficiarySelect.addEventListener("change", function () {
            const result = getCurrentCustomer();

            if (!result) return;

            const data = getBankData(result.customer);

            if (this.value === "") {
                return;
            }

            const selected = data.beneficiaries[
                Number(this.value)
            ];

            if (!selected) {
                showMessage("Invalid demo beneficiary selection.", "error");
                return;
            }

            accountNumberInput.value =
                selected.account || selected.accountNumber || "";

            bankNameInput.value = selected.bank || "";

            showMessage("Demo beneficiary selected.", "success");
        });
    }

    // Review the simulated transfer.
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const result = getCurrentCustomer();

            if (!result) return;

            const data = getBankData(result.customer);

            const selectedIndex = beneficiarySelect.value;

            let recipientAccount = accountNumberInput.value.trim();
            let recipientBank = bankNameInput.value.trim();
            let recipientName = "";

            if (selectedIndex !== "") {
                const selected = data.beneficiaries[
                    Number(selectedIndex)
                ];

                if (!selected) {
                    showMessage(
                        "Please select a valid demo beneficiary.",
                        "error"
                    );
                    return;
                }

                recipientAccount =
                    selected.account || selected.accountNumber || "";

                recipientBank = selected.bank || "";
                recipientName = selected.name || "";
            }

            const transferAmount = Number(amountInput.value);

            const customerAccount =
                result.customer.accountNumber ||
                result.customer.profile.accountNumber ||
                "";

            if (!/^[0-9]{6,20}$/.test(recipientAccount)) {
                showMessage(
                    "Enter a valid fictional recipient account number.",
                    "error"
                );
                return;
            }

            if (!recipientBank) {
                showMessage(
                    "Enter a fictional recipient bank name.",
                    "error"
                );
                return;
            }

            if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
                showMessage(
                    "Enter a valid demo transfer amount.",
                    "error"
                );
                return;
            }

            if (!Number.isSafeInteger(Math.round(transferAmount * 100))) {
                showMessage("Enter a valid amount.", "error");
                return;
            }

            if (recipientAccount === customerAccount) {
                showMessage(
                    "You cannot transfer to your own demo account.",
                    "error"
                );
                return;
            }

            const balance = Number(data.balance) || 0;

            if (transferAmount > balance) {
                showMessage(
                    "Insufficient simulated available balance.",
                    "error"
                );
                return;
            }

            pendingTransfer = {
                account: recipientAccount,
                bank: recipientBank,
                name: recipientName,
                amount: transferAmount,
                narration: narrationInput.value.trim()
            };

            // Display the review using safe text nodes.
            confirmationDetails.innerHTML = "";

            addConfirmationRow(
                "Recipient",
                recipientName || "New demo recipient"
            );

            addConfirmationRow(
                "Demo Account",
                recipientAccount
            );

            addConfirmationRow(
                "Demo Bank",
                recipientBank
            );

            addConfirmationRow(
                "Amount",
                formatCurrency(transferAmount)
            );

            addConfirmationRow(
                "Narration",
                pendingTransfer.narration || "No narration"
            );

            confirmation.hidden = false;

            showMessage(
                "Review the fictional transfer details before confirming."
            );
        });
    }

    // Confirm and record the simulated transfer.
    if (confirmButton) {
        confirmButton.addEventListener("click", function () {
            if (!pendingTransfer) {
                showMessage("There is no pending demo transfer.", "error");
                return;
            }

            const result = getCurrentCustomer();

            if (!result) return;

            const data = getBankData(result.customer);
            const balance = Number(data.balance) || 0;

            if (pendingTransfer.amount > balance) {
                hideConfirmation();

                showMessage(
                    "Insufficient simulated balance. Please review your account.",
                    "error"
                );

                return;
            }

            const newBalance = balance - pendingTransfer.amount;

            const reference =
                "DEMO-" +
                Date.now().toString();

            const date = new Date().toLocaleString("en-NG");

            const transaction = {
                type: "Transfer",
                amount: pendingTransfer.amount,
                detail: "Demo transfer to " + pendingTransfer.account,
                description: "Simulated transfer to " + pendingTransfer.account,
                date: date,
                narration: pendingTransfer.narration,
                reference: reference,
                status: "Demo Recorded",
                recipient: pendingTransfer.name || "Demo recipient",
                recipientAccount: pendingTransfer.account,
                recipientBank: pendingTransfer.bank
            };

            // Update only the fictional demo account.
            data.balance = newBalance;
            data.transactions.unshift(transaction);

            // Save the new demo recipient if not already saved.
            const alreadySaved = data.beneficiaries.some(function (item) {
                const savedAccount =
                    item.account || item.accountNumber || "";

                return savedAccount === pendingTransfer.account;
            });

            if (!alreadySaved) {
                data.beneficiaries.push({
                    name: pendingTransfer.name ||
                        "Demo Recipient " +
                        pendingTransfer.account.slice(-4),
                    account: pendingTransfer.account,
                    bank: pendingTransfer.bank
                });
            }

            result.customer.bankData = data;
            result.customers[result.index] = result.customer;

            if (!saveCustomers(result.customers)) {
                return;
            }

            hideConfirmation();
            form.reset();

            loadBeneficiaries();

            showMessage(
                "Demo transfer recorded successfully. Reference: " +
                reference +
                ". No real money was sent.",
                "success"
            );
        });
    }

    // Cancel the pending simulated transfer.
    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            hideConfirmation();

            showMessage(
                "Demo transfer cancelled. Your simulated balance was not changed."
            );
        });
    }

    // Initial page setup.
    if (!form || !beneficiarySelect || !confirmationDetails) {
        console.error("Transfer page is missing required HTML elements.");
        return;
    }

    loadBeneficiaries();

    window.addEventListener("pageshow", function () {
        loadBeneficiaries();
    });

});
