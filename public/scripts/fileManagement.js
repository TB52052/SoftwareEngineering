document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('semesterForm').addEventListener('submit', function(event) {
        event.preventDefault(); 

        var selectedSemester = document.getElementById('seasonForm').value;
        console.log('Selected Semester:', selectedSemester);
       
        checkFileName(selectedSemester);
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
            window.location.href = "/dashboard";
            
        } else {
            alert("File name doesn't match.");
        }
    } else {
        alert("Please select a file.");
    }
}
