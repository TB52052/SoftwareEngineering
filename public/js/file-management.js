var selectedSemester = null;

document.addEventListener("DOMContentLoaded", async function () {
    getSemesters();
    document.getElementById("seasonForm").addEventListener("change", function (event) { updateSemesterForm(); });
    document.querySelector("#fileInputForm").addEventListener("change", function (event) { updateFileInputform(); });
});

function getSemesters() {
    fetch("/profile/semester-data")
        .then((response) => response.json())
        .then((data) => {
            const semesterForm = document.getElementById("seasonForm");
            data.forEach((semester) => {
                const option = document.createElement("option");
                option.value = semester.Season;
                option.text = semester.Season;
                semesterForm.appendChild(option);
            });
        })
        .catch((error) => console.error("Error:", error));
}


function updateSemesterForm() {
    selectedSemester = document.getElementById("seasonForm").value;
    let fileInputForm = document.getElementById("fileInputForm");
    fileInputForm.value = null;

    if (selectedSemester === "Select Semester") {
        return fileInputForm.classList.add("hidden");
    }

    fetch("/profile/check-semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedSemester: selectedSemester }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.exists) {
            fileInputForm.classList.add("hidden");
            // Show pop-up to confirm loading semester
            if (confirm("Semester already exists! Do you want to load this semesters tasks?")) {
                // If user clicks 'OK', redirect to dashboard
                window.location.href = "/dashboard"; 
            } else {
                // If user clicks 'Cancel', reload profile page
                window.location.href = "/profile";
            }
        }
        else {
            fileInputForm.classList.remove("hidden");
        }
    })
    .catch((error) => console.error("Error:", error));
}

function updateFileInputform(event) {
    const fileInput = document.getElementById("fileInputForm");
    const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : "No file selected";

    if (!compareSemesterNames(fileName, selectedSemester)) {
        return alert("The file name does not match the selected semester.");
    }


    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                const dataToSend = {
                    semester: selectedSemester,
                    modules: jsonData,
                };

                fetch("/profile/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                    .catch((error) => console.error("Error:", error));

                    alert("Semester uploaded to database    ");
                    // Redirect to dashboard
                    window.location.href = "/dashboard"; 


            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
        reader.readAsText(file);
    }
}

function compareSemesterNames(fileName, selectedSemester) {
    return fileName.replace(".json", "") === selectedSemester;
}