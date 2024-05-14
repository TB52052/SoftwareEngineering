document.addEventListener("DOMContentLoaded", function () {
    // Get the title of the page
    let title = document.title;
    let navbarNames = document.querySelectorAll(".navbar-name");
    navbarNames.forEach((navbarName) => {
        if (title.includes(navbarName.textContent)) {
            let parent = navbarName.parentElement;
            parent.classList.add("selected");
        }
    });
});

function logout() {
    fetch("/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = "/login";
        }
    });
}
