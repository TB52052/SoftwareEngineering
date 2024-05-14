document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('semesterForm').addEventListener('submit', function(event) {
        event.preventDefault(); 

        var selectedSemester = document.getElementById('seasonForm').value;
        console.log('Selected Semester:', selectedSemester);
       
        checkFileName(selectedSemester);
    });
});

function getExpectedFileName(selectedSemester) {
    // Extract the semester and year range from the selected semester
    const [semester, yearRange] = selectedSemester.split(' ');

    // Construct the expected filename
    const expectedFileName = `${semester}_${yearRange}_template.json`;

    return expectedFileName;
}

function checkFileName(selectedSemester) {
    var fileInput = document.getElementById('fileInputForm');
    if (fileInput.files.length > 0) {
        var uploadedFileName = fileInput.files[0].name;

        // Generate the expected filename based on the selected semester
        var expectedFileName = getExpectedFileName(selectedSemester);

        if (uploadedFileName === expectedFileName) {
            alert("File name matches!");
            window.location.href = "/dashboard";
        } else {
            alert("File name doesn't match.");
        }
    } else {
        alert("Please select a file.");
    }
}
