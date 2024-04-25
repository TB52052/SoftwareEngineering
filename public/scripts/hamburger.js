document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("hamburger-toggle").addEventListener("click", function() {
        document.querySelector(".sidebar").classList.toggle("open");
    });
});
