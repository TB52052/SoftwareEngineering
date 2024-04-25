document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("hamburger-toggle").addEventListener("click", function() {
        this.classList.toggle("open"); // Toggle hamburger icon
        document.querySelector(".sidebar").classList.toggle("open"); // Toggle sidebar
    });
});
