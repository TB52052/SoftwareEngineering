
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('semesterForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
        var selectedSemester = document.getElementById('seasonForm').value;
        console.log('Selected Semester:', selectedSemester);
        checkFileName(selectedSemester);
        otherFileFunction(selectedSemester); 
    });

    document.getElementById('fileInputFrom').addEventListener('change', function() {
        const fileInput = document.getElementById('fileInputForm');
        const file = fileInput.files[0];

        var selectedSemester = document.getElementById('seasonForm').value;

        const formData = new FormData();
        formData.append('filename', file);

        fetch('/upload', {
            method: 'POST',
            body: {data: formData, sem: selectedSemester}
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
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


