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
