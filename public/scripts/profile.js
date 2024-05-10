document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll('.profile-actions button');
    const forms = document.querySelectorAll('.form-container > div');

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            toggleForm(forms[index]);
        });
    });
});

function toggleForm(form) {
    const allForms = document.querySelectorAll('.form-container > div');
    allForms.forEach(f => {
        f.classList.add('hidden');
    });
    form.classList.remove('hidden');
}

document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll(".profile-actions button");

    buttons.forEach(button => {
        button.addEventListener("click", function() {
            // Remove "pulse" class from all buttons
            buttons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove("pulse");
                }
            });

            // Add "pulse" class to the clicked button
            button.classList.add("pulse");
        });
    });
});