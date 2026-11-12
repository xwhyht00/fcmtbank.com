
document.addEventListener("DOMContentLoaded", function () {

  /* =====================================
     MOBILE NAVIGATION
  ===================================== */

  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  if (menuToggle && navigation) {

    function closeMenu() {
      navigation.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.innerHTML = "☰";
    }

    function toggleMenu() {
      const isOpen = navigation.classList.toggle("active");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.innerHTML = isOpen ? "✕" : "☰";
    }

    menuToggle.addEventListener("click", toggleMenu);

    // Close menu after selecting a navigation link
    const navLinks = navigation.querySelectorAll("a");

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close menu when Escape is pressed
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
      }
    });

    // Close mobile menu when switching to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }


  /* =====================================
     CONTACT FORM - DEMO ONLY
  ===================================== */

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  if (contactForm && formMessage) {

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const nameField = document.getElementById("customerName");
      const emailField = document.getElementById("customerEmail");
      const messageField = document.getElementById("customerMessage");

      if (!nameField || !emailField || !messageField) {
        formMessage.textContent =
          "The demonstration form is not configured correctly.";
        return;
      }

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      // Check that all fields have been completed
      if (!name || !email || !message) {
        formMessage.textContent = "Please complete all fields.";
        return;
      }

      // Basic email format validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        formMessage.textContent = "Please enter a valid demonstration email address.";
        return;
      }

      // This prototype does not collect or transmit form information
      formMessage.textContent =
        "Demo only: this form does not send or store messages. Do not enter real personal information.";

      contactForm.reset();
    });
  }


  /* =====================================
     FOOTER YEAR
  ===================================== */

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

});
