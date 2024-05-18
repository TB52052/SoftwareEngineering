
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('semesterForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
        var selectedSemester = document.getElementById('seasonForm').value;
        checkFileName(selectedSemester);
        otherFileFunction(selectedSemester); 
    });
    
    document.querySelector('#fileInputForm').addEventListener('change', function(event) {
        const fileInput = document.getElementById('fileInputForm');
        const selectedSemester = document.getElementById('seasonForm').value;
    
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
    
            reader.onload = function(event) {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    const dataToSend = {
                        semester: selectedSemester,
                        assessments: jsonData
                    };
    
                    fetch('/profile/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSend)
                    })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error:', error));
                } catch (error) { console.error('Error parsing JSON:', error); }
            };
            reader.readAsText(file);
        }
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


