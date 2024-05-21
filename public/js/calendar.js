let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", function() {
    const userId = 1;  // This should ideally be dynamically set based on the logged-in user.
    showCalendar(currentMonth, currentYear, userId);
});

async function showCalendar(month, year, userId) {
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    const calendarBody = document.getElementById("calendar-body");
    const monthAndYear = document.getElementById("monthAndYear");

    calendarBody.innerHTML = "";  // Clear previous calendar entries
    monthAndYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            let cell = document.createElement("td");
            if (i === 0 && j < firstDay || date > daysInMonth) {
                cell.classList.add("empty");
            } else {
                cell.textContent = date;
                cell.setAttribute("data-date", date);
                cell.setAttribute("data-month", month + 1);  // Adjust for zero-index month.
                cell.setAttribute("data-year", year);
                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
    await fetchEventsAndTasks(userId, year, month);
}

async function fetchEventsAndTasks(userId, year, month) {
    const baseUrl = `/api/user/${userId}`;
    try {
        const assessmentsResponse = await fetch(`${baseUrl}/assessments`);
        const tasksResponse = await fetch(`${baseUrl}/tasks`);
        const assessments = await assessmentsResponse.json();
        const tasks = await tasksResponse.json();

        // Adding assessments to the calendar
        assessments.forEach(assessment => {
            const date = new Date(assessment.AssessmentDate);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const eventName = `${assessment.ModuleName}: ${assessment.AssessmentName}`;
                addEventToCalendar(date.getDate(), eventName, 'red');
            }
        });

    
        tasks.forEach(task => {
            const date = new Date(task.TaskDate);
            if (date.getFullYear() === year && date.getMonth() === month) {
                addEventToCalendar(date.getDate(), task.AssessmentName, task.TypeName, task.TimeSpent, task.ModuleName, task.description || 'No additional details provided.');
            }
        });
    } catch (err) {
        console.error('Error fetching events and tasks:', err);
    }
    addEventListenersToEvents();
}

function addEventToCalendar(day, assessmentName, typeName, timeSpent, moduleName, details) {
    const cells = document.querySelectorAll(`td[data-date="${day}"][data-month="${currentMonth + 1}"][data-year="${currentYear}"]`);
    cells.forEach(cell => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.textContent = `${assessmentName || 'No Assessment'} - ${typeName || 'No Type'}, Time: ${timeSpent || '0'} mins`;
        eventDiv.setAttribute('data-module-name', moduleName);
        eventDiv.setAttribute('data-assessment-name', assessmentName);
        eventDiv.setAttribute('data-type-name', typeName);
        eventDiv.setAttribute('data-time-spent', timeSpent);
        eventDiv.addEventListener('click', () => {
            openModal(moduleName, assessmentName, typeName, timeSpent);
        });
        cell.appendChild(eventDiv);
    });
}



function moveDate(dir) {
    currentMonth += dir;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
    }
    const userId = 1;  // Assume the user ID remains the same; change as needed.
    showCalendar(currentMonth, currentYear, userId);
}

function openModal(moduleName, assessmentName, typeName, timeSpent) {
    if (!moduleName || !assessmentName || !typeName || timeSpent === undefined) {
        console.error("Invalid data provided to modal:", moduleName, assessmentName, typeName, timeSpent);
        return; // Exit if data is invalid
    }
    const modal = document.getElementById('modal');
    const detailsElement = document.getElementById('modal-details');
    detailsElement.innerHTML = `
        <h2>${assessmentName} - ${typeName}</h2>
        <p><strong>Module:</strong> ${moduleName}</p>
        <p><strong>Duration:</strong> ${timeSpent} minutes</p>
    `;
    modal.style.display = 'block'; // Show the modal
}



// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none'; // Hide the modal
}

// Attaching the closeModal function to the close button
document.querySelector('.close').addEventListener('click', closeModal);

function addEventListenersToEvents() {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        event.addEventListener('click', () => {
            const title = event.getAttribute('data-title');
            const details = event.getAttribute('data-details');
            openModal(title, details);
        });
    });
}


