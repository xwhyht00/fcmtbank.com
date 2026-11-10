
const demoAccount = {
    accountNumber: "0123456789",
    accountType: "Personal Savings",
    currency: "NGN",
    bankName: "DBS-BANK Demo"
};

const profile = JSON.parse(
    localStorage.getItem("dbsDemoProfile") || "null"
);

const customerName = profile?.name || "Demo Customer";

document.getElementById("accountHolder").textContent =
    customerName;

document.getElementById("holderName").textContent =
    customerName;

document.getElementById("accountNumber").textContent =
    demoAccount.accountNumber;

document.getElementById("copyAccount").addEventListener(
    "click",
    async function() {

        const message = document.getElementById("message");

        try {
            await navigator.clipboard.writeText(
                demoAccount.accountNumber
            );

            message.textContent =
                "Demo account number copied successfully.";

        } catch (error) {

            message.textContent =
                "Unable to copy. Please copy the number manually.";

        }
    }
);
