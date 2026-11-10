
const editButton = document.getElementById("editButton");
const editForm = document.getElementById("editForm");
const message = document.getElementById("message");

const STORAGE_KEY = "dbsDemoProfile";

function getProfile() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            name: "Demo Customer",
            email: "demo@example.com",
            phone: "Not provided"
        };
    } catch {
        return {
            name: "Demo Customer",
            email: "demo@example.com",
            phone: "Not provided"
        };
    }
}

function displayProfile() {
    const profile = getProfile();

    document.getElementById("customerName").textContent = profile.name;
    document.getElementById("fullName").textContent = profile.name;
    document.getElementById("email").textContent = profile.email;
    document.getElementById("phone").textContent = profile.phone;
}

editButton.addEventListener("click", function() {

    const profile = getProfile();

    document.getElementById("editName").value = profile.name;
    document.getElementById("editEmail").value = profile.email;
    document.getElementById("editPhone").value = profile.phone;

    editForm.hidden = !editForm.hidden;
});

editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const profile = {
        name: document.getElementById("editName").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        phone: document.getElementById("editPhone").value.trim()
    };

    if (!profile.name || !profile.email || !profile.phone) {
        message.textContent = "Please complete all fields.";
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

    displayProfile();

    editForm.hidden = true;

    message.textContent = "Demo profile updated successfully.";

});

displayProfile();
