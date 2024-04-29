document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("hamburger-toggle").addEventListener("click", function() {
        this.classList.toggle("open"); // Toggle hamburger icon
        document.querySelector(".sidebar").classList.toggle("open"); // Toggle sidebar
        document.querySelector(".sidebar-wrapper").classList.toggle("open"); // Toggle content
    });
});

function logout() {
    console.log("Logging out...");
    fetch("/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.status === 200) {
            window.location.href = "/login";
        }
    });
}

