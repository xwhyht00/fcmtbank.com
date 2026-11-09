
document.addEventListener("DOMContentLoaded", () => {

  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  menuToggle.addEventListener("click", () => {
    navigation.classList.toggle("active");

    menuToggle.textContent =
      navigation.classList.contains("active") ? "✕" : "☰";
  });

  // Close mobile navigation after selecting a link
  document.querySelectorAll(".navigation a").forEach(link => {
    link.addEventListener("click", () => {
      navigation.classList.remove("active");
      menuToggle.textContent = "☰";
    });
  });

  // Contact form frontend validation
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  contactForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const message = document.getElementById("customerMessage").value.trim();

    if (!name || !email || !message) {
      formMessage.textContent = "Please complete all fields.";
      formMessage.style.color = "#b30c28";
      return;
    }

    formMessage.textContent =
      "Your enquiry form is ready. Connect an authorized backend to submit enquiries.";

    formMessage.style.color = "#16845d";
  });

  // Highlight navigation section when scrolling
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".navigation a");

  window.addEventListener("scroll", () => {
    let currentSection = "";

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 130;

      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active-link");

      if (link.getAttribute("href") === "#" + currentSection) {
        link.classList.add("active-link");
      }
    });
  });

});
