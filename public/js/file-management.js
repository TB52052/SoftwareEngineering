var selectedSemester = null;

document.addEventListener("DOMContentLoaded", async function () {
    getSemesters();
    document.getElementById("seasonForm").addEventListener("change", function (event) { updateSemesterForm(); });
    document.querySelector("#fileInputForm").addEventListener("change", function (event) { updateFileInputform(); });
    document.querySelector("#submit-semester").addEventListener("click", function (event) { selectSubmit(); });
});

function getSemesters() {
    fetch("/profile/semester-data")
        .then((response) => response.json())
        .then((data) => {
            const semesterForm = document.getElementById("seasonForm");
            data.forEach((semester) => {
                console.log(semester);
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
                // Semester exists, load dashboard
                fileInputForm.classList.add("hidden");
            }
            else {
                fileInputForm.classList.remove("hidden");
            }
        })
        .catch((error) => console.error("Error:", error));
}

function updateFileInputform(event) {
    console.log("updateFileInputform");
    const fileInput = document.getElementById("fileInputForm");

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                const dataToSend = {
                    semester: selectedSemester,
                    assessments: jsonData,
                };

                fetch("/profile/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                    .catch((error) => console.error("Error:", error));
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
        reader.readAsText(file);
    }
}

function getExpectedFileName(selectedSemester) {
    const [semester, yearRange] = selectedSemester.split(" ");
    // expected filename
    const expectedFileName = `${semester} ${yearRange}.json`;
    return expectedFileName;
}

function checkFileName(selectedSemester) {
    var fileInput = document.getElementById("fileInputForm");
    if (fileInput.files.length > 0) {
        var uploadedFileName = fileInput.files[0].name;

        var expectedFileName = getExpectedFileName(selectedSemester);

        if (uploadedFileName === expectedFileName) {
            alert("File name matches!");
            // redirecting with information
            window.location.href = "/dashboard?semester=" + selectedSemester;
        } else {
            alert("File name doesn't match.");
        }
    } else {
        alert("Please select a file.");
    }
}
