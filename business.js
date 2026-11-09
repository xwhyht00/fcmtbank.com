
document.addEventListener("DOMContentLoaded", function () {

  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  menuToggle.addEventListener("click", function () {

    const isOpen = navigation.classList.toggle("active");

    menuToggle.innerHTML = isOpen ? "✕" : "☰";

    menuToggle.setAttribute("aria-expanded", isOpen);

  });

  // Close navigation after selecting a page
  const navigationLinks = navigation.querySelectorAll("a");

  navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

      navigation.classList.remove("active");

      menuToggle.innerHTML = "☰";

      menuToggle.setAttribute("aria-expanded", "false");

    });

  });

  // Smooth scrolling for section links
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

    });

  });

});
