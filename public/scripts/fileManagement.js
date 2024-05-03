document.addEventListener("DOMContentLoaded", function(){

    document.getElementById('semesterForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
       
        var selectedSemester = document.getElementById('seasonForm').value;
        console.log('Selected Semester:', selectedSemester);
       
        var expectedFileName = getExpectedFileName(selectedSemester);
        console.log('Expected File Name:', expectedFileName);
       });

});





function checkFileName() {
var fileInput = document.getElementById('fileInputForm'); // Corrected ID
if (fileInput.files.length > 0) {
var uploadedFileName = fileInput.files[0].name;

if (uploadedFileName === expectedFileName) {
alert("File name matches!");
} else {
alert("File name doesn't match.");
}
} else {
alert("Please select a file.");
}
}
