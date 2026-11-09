
document.addEventListener("DOMContentLoaded", function () {

  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  // Mobile navigation
  menuToggle.addEventListener("click", function () {

    const isOpen = navigation.classList.toggle("active");

    menuToggle.innerHTML = isOpen ? "✕" : "☰";

    menuToggle.setAttribute("aria-expanded", isOpen);

  });

  // Close menu when a navigation link is clicked
  const navigationLinks = navigation.querySelectorAll("a");

  navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

      navigation.classList.remove("active");

      menuToggle.innerHTML = "☰";

      menuToggle.setAttribute("aria-expanded", "false");

    });

  });

});
