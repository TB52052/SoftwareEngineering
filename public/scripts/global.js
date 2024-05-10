document.addEventListener("DOMContentLoaded", function() {
    // Session Error Check
    fetch('/get-session-message')
    .then(response => response.json())
    .then(sessionMessage => {
        showError(sessionMessage);

    }).catch(error => {});
});

function showError(error) {
    if (error) {
        const errorBox = document.getElementById('error-box');
        errorBox.textContent = error;

        // Clear the error message
        fetch('/clear-session-message')
        .then(response => response.json())
        .then(sessionMessage => {
            errorBox.classList.remove('hidden');
            setTimeout(() => {errorBox.classList.add('hidden');}, 2500);
        }).catch(error => {});
    }   
}