
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('semesterForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
        var selectedSemester = document.getElementById('seasonForm').value;
        console.log('Selected Semester:', selectedSemester);
        checkFileName(selectedSemester);
        otherFileFunction(selectedSemester); 
    });
});

function getExpectedFileName(selectedSemester) {
    const [semester, yearRange] = selectedSemester.split(' ');
    // expected filename
    const expectedFileName = `${semester} ${yearRange}.json`;
    return expectedFileName;
}

function checkFileName(selectedSemester) {
    var fileInput = document.getElementById('fileInputForm');
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

const jsonData = fs.readFileSync(fileInput);
const data1 = JSON.parse(jsonData);

const insertStmt = db.prepare(`INSERT INTO FileInformation (ModuleID, AssessmentID) VALUES (?, ?)`);
    data.forEach(item => {
        insertStmt.run(item.ModuleID, item.AssessmentID);
    });
    insertStmt.finalize();

    // Retrieve and display the data
    db.each('SELECT * FROM FileInformation', (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(row);
    });

