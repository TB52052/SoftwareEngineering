document.addEventListener("DOMContentLoaded", function() {
    // Session Error Check
    fetch('/get-session-data')
    .then(response => response.json())
    .then(sessionData => {
        showError(sessionData);
    }).catch(error => {});
});

function showError(error) {
    if (error) {
        console.log(error);
    }   
}

