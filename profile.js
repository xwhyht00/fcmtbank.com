
/* ==========================================
   NOVACREST BANK - DEMO PROFILE
   Fictional Banking Software Prototype
   Uses existing demo customer storage.
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const CUSTOMERS_KEY = "dbsDemoCustomers";
    const SESSION_KEY = "dbsDemoSession";
    const LEGACY_PROFILE_KEY = "dbsDemoProfile";

    const editButton = document.getElementById("editButton");
    const editForm = document.getElementById("editForm");
    const cancelButton = document.getElementById("cancelButton");
    const message = document.getElementById("message");

    const customerName = document.getElementById("customerName");
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editPhone = document.getElementById("editPhone");

    const currentYear = document.getElementById("currentYear");

    function readStorage(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Demo storage could not be read:", error);
            return fallback;
        }
    }

    function showMessage(text, isError = false) {
        if (!message) return;

        message.textContent = text;
        message.style.color = isError ? "#b42318" : "#087b45";
    }

    // Check the current demo login session.
    const session = readStorage(SESSION_KEY, null);

    const customers = readStorage(CUSTOMERS_KEY, []);

    if (
        !session ||
        !session.email ||
        !session.accountNumber ||
        !Array.isArray(customers)
    ) {
        window.location.replace("login.html");
        return;
    }

    // Find the logged-in demo customer.
    const customerIndex = customers.findIndex(function (item) {
        return (
            item &&
            item.profile &&
            item.profile.email === session.email &&
            item.profile.accountNumber === session.accountNumber
        );
    });

    if (customerIndex === -1) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("login.html");
        return;
    }

    const customer = customers[customerIndex];

    if (!customer.profile) {
        customer.profile = {};
    }

    // Fill in missing optional profile fields.
    if (!customer.profile.name) {
        customer.profile.name = "Demo Customer";
    }

    if (!customer.profile.phone) {
        customer.profile.phone = "";
    }

    // Keep the generated demo email unchanged.
    if (editEmail) {
        editEmail.readOnly = true;
        editEmail.title = "Your generated demo email cannot be changed here.";
    }

    function displayProfile() {

        const profile = customer.profile;

        if (customerName) {
            customerName.textContent = profile.name;
        }

        if (fullName) {
            fullName.textContent = profile.name;
        }

        if (email) {
            email.textContent = profile.email;
        }

        if (phone) {
            phone.textContent = profile.phone || "Not provided";
        }

        if (editName) {
            editName.value = profile.name;
        }

        if (editEmail) {
            editEmail.value = profile.email;
        }

        if (editPhone) {
            editPhone.value = profile.phone || "";
        }
    }

    // Open or close the edit form.
    if (editButton && editForm) {

        editButton.addEventListener("click", function () {

            displayProfile();

            editForm.hidden = !editForm.hidden;

            if (!editForm.hidden) {
                editButton.textContent = "Close Edit Form";
                showMessage("");
            } else {
                editButton.textContent = "Edit Demo Profile";
            }
        });
    }

    // Cancel profile editing.
    if (cancelButton && editForm) {

        cancelButton.addEventListener("click", function () {

            displayProfile();

            editForm.hidden = true;

            if (editButton) {
                editButton.textContent = "Edit Demo Profile";
            }

            showMessage("Editing cancelled.");
        });
    }

    // Save changes to the logged-in demo customer.
    if (editForm) {

        editForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const newName = editName.value.trim();
            const newPhone = editPhone.value.trim();

            if (!newName) {
                showMessage("Please enter a demo display name.", true);
                return;
            }

            if (newName.length > 40) {
                showMessage("Display name must not exceed 40 characters.", true);
                return;
            }

            // Update the customer's existing profile.
            customer.profile.name = newName;
            customer.profile.phone = newPhone;

            // Preserve all other customer records.
            customers[customerIndex] = customer;

            try {

                localStorage.setItem(
                    CUSTOMERS_KEY,
                    JSON.stringify(customers)
                );

                // Maintain compatibility with older demo pages.
                localStorage.setItem(
                    LEGACY_PROFILE_KEY,
                    JSON.stringify({
                        name: newName,
                        email: customer.profile.email,
                        phone: newPhone
                    })
                );

                displayProfile();

                editForm.hidden = true;

                if (editButton) {
                    editButton.textContent = "Edit Demo Profile";
                }

                showMessage("Demo profile updated successfully.");

            } catch (error) {

                console.error("Unable to save demo profile:", error);

                showMessage(
                    "Unable to save changes in this browser. Please try again.",
                    true
                );
            }
        });
    }

    // Update footer year.
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Show the current demo profile.
    displayProfile();

});
