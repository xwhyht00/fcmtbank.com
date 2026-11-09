```javascript
document.addEventListener("DOMContentLoaded", function () {

    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("navigation");

    if (menuToggle && navigation) {
        menuToggle.addEventListener("click", function () {
            navigation.classList.toggle("show");

            const isOpen = navigation.classList.contains("show");

            menuToggle.textContent = isOpen ? "✕" : "☰";
            menuToggle.setAttribute("aria-expanded", isOpen);
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
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

    // Contact form demonstration
    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");

    if (contactForm && formMessage) {

        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            formMessage.className = "form-message success";

            formMessage.textContent =
                "Your form has passed validation. This is a website demo, so your message has NOT been sent. Connect a secure backend or form service to receive enquiries.";

            contactForm.reset();
        });
    }

});
```
