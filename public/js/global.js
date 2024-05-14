document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-session-message")
        .then((response) => response.json())
        .then((sesisonData) => {
            showMessage(sesisonData.message, sesisonData.isError);
        });
});

function showMessage(msg, isError) {
    if (msg) {
        const errorBox = document.getElementById("error-box");
        errorBox.textContent = msg;

        if (isError) {
            errorBox.classList.add("isError");
        } else {
            errorBox.classList.remove("isError");
        }

        // Clear the error message
        fetch("/clear-session-message")
            .then((response) => response.json())
            .then((sessionMessage) => {
                errorBox.classList.remove("hidden");
                setTimeout(() => {
                    errorBox.classList.add("hidden");
                }, 2500);
            });
    }
}
