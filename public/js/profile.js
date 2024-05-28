document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".profile-actions button");
    const forms = document.querySelectorAll(".form-container > div");

    // Add toggleForm event listener to each middle bar button
    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            toggleForm(forms[index]);
        });

        button.addEventListener("click", function () {
            // Remove "pulse" class from all buttons
            buttons.forEach((btn) => {
                if (btn !== button) {
                    btn.classList.remove("pulse");
                }
            });

            button.classList.add("pulse");
        });
    });

    const nameSubmit = document.getElementById("submit-name-edit");
    nameSubmit.addEventListener("click", () => {
        submitNameEditRquest();
    });

    const passwordSubmit = document.getElementById("submit-password-edit");
    passwordSubmit.addEventListener("click", () => {
        submitPasswordEditRequest();
    });

    const deleteSubmit = document.getElementById("submit-delete-account");
    deleteSubmit.addEventListener("click", () => {
        deleteAccount();
    });

    // Fetch user data
    fetch("/profile/user-data")
        .then((response) => {
            if (response.status === 500) {
                return showMessage("Error fetching user data", true);
            }
            return response.json();
        })
        .then((data) => {
            document.getElementById("name-span").textContent = data.name + " " + data.surname;
            document.getElementById("email-span").textContent = data.email;
        });
});

function submitNameEditRquest() {
    const password = document.getElementById("name-password").value;
    const newName = document.getElementById("name-edit").value;
    const newSurname = document.getElementById("surname-edit").value;

    if (newName === "" || newSurname === "" || password === "") {
        return showMessage("Please enter all data", true);
    }

    fetch("/profile/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, newName, newSurname }),
    }).then((response) => {
        if (response.status === 200) {
            // Update the name in the profile
            document.getElementById("name-span").textContent = newName + " " + newSurname;
            return showMessage("Name updated", false);
        }
        if (response.status === 403) {
            return showMessage("Incorrect Password", true);
        }
        if (response.status === 500) {
            return showMessage("Error updating name", true);
        }
    });
    eraseInputs();
}

function submitPasswordEditRequest() {
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
        return showMessage("Please enter all data", true);
    }

    if (newPassword !== confirmPassword) {
        return showMessage("Passwords do not match", true);
    }

    fetch("/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
    }).then((response) => {
        if (response.status === 200) {
            return showMessage("Password updated", false);
        }
        if (response.status === 403) {
            return showMessage("Incorrect Password", true);
        }
        if (response.status === 500) {
            return showMessage("Error updating password", true);
        }
    });
    eraseInputs();
}

function deleteAccount() {
    const password = document.getElementById("delete-password").value;

    if (password === "") {
        return showMessage("Please enter your password", true);
    }

    fetch("/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    }).then((response) => {
        if (response.status === 200) {
            return logout();
        }
        eraseInputs();
        if (response.status === 403) {
            return showMessage("Incorrect Password", true);
        }
        if (response.status === 500) {
            return showMessage("Error deleting account", true);
        }
    });
}

function toggleForm(form) {
    const allForms = document.querySelectorAll(".form-container > div");
    allForms.forEach((f) => {
        f.classList.add("hidden");
    });
    form.classList.remove("hidden");
    eraseInputs();
}

function eraseInputs() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
        input.value = "";
    });
}
