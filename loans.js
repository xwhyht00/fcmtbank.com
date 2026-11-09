```javascript
document.addEventListener("DOMContentLoaded", function () {

    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("navigation");

    if (menuToggle && navigation) {
        menuToggle.addEventListener("click", function () {
            navigation.classList.toggle("show");

            const isOpen = navigation.classList.contains("show");
            menuToggle.setAttribute("aria-expanded", isOpen);
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navigation.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navigation.classList.remove("show");
                menuToggle.textContent = "☰";
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Automatic copyright year
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Loan repayment calculator
    const calculateButton = document.getElementById("calculateButton");
    const result = document.getElementById("calculatorResult");

    if (calculateButton && result) {
        calculateButton.addEventListener("click", function () {

            const amount = Number(
                document.getElementById("loanAmount").value
            );

            const annualRate = Number(
                document.getElementById("interestRate").value
            );

            const years = Number(
                document.getElementById("loanYears").value
            );

            if (
                !Number.isFinite(amount) ||
                !Number.isFinite(annualRate) ||
                !Number.isFinite(years) ||
                amount <= 0 ||
                annualRate < 0 ||
                years <= 0 ||
                years > 40
            ) {
                result.textContent =
                    "Please enter a valid loan amount, interest rate, and repayment period.";
                return;
            }

            const months = years * 12;
            const monthlyRate = annualRate / 100 / 12;

            let monthlyPayment;

            if (monthlyRate === 0) {
                monthlyPayment = amount / months;
            } else {
                const factor = Math.pow(1 + monthlyRate, months);

                monthlyPayment =
                    amount *
                    (monthlyRate * factor) /
                    (factor - 1);
            }

            if (!Number.isFinite(monthlyPayment)) {
                result.textContent =
                    "Unable to calculate this payment. Please check your entries.";
                return;
            }

            const totalPayment = monthlyPayment * months;

            result.innerHTML =
                "Estimated monthly payment: <strong>" +
                monthlyPayment.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) +
                "</strong><br><br>" +
                "Estimated total repayment: " +
                totalPayment.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) +
                "<br><small>Illustrative estimate only. Actual rates, fees, and repayment terms may differ.</small>";
        });
    }

});
```
