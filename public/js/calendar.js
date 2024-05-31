let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const userId = req.session.user.id;

document.addEventListener("DOMContentLoaded", function() {
    console.log('User ID:', currentUserId);
    showCalendar(currentMonth, currentYear, currentUserId);
});

async function showCalendar(month, year, userId) {
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    const calendarBody = document.getElementById("calendar-body");
    const monthAndYear = document.getElementById("monthAndYear");

    calendarBody.innerHTML = "";  // Clear previous calendar 
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
                cell.setAttribute("data-month", month + 1);  
                cell.setAttribute("data-year", year);
                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }

    await fetchEventsAndTasks(userId, year, month);
    addEventListenersToEvents();
}

async function fetchEventsAndTasks(userId, year, month) {
    clearCalendarEvents();

    await fetchAssessments(userId, year, month);
    await fetchTasks(userId, year, month);
}

async function fetchAssessments(userId, year, month) {
    const baseUrl = `/api/user/${userId}/assessments`;
    try {
        const response = await fetch(baseUrl);
        const assessments = await response.json();

        console.log('Assessments fetched:', assessments);

        assessments.forEach(assessment => {
            console.log('Processing assessment:', assessment);
            const dateParts = assessment.AssessmentDate.split('/');
            const assessmentDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            if (assessmentDate.getFullYear() === year && assessmentDate.getMonth() === month) {
                addAssessmentToCalendar(assessmentDate.getDate(), assessment);
            }
        });

    } catch (err) {
        console.error('Error fetching assessments:', err);
    }
}

async function fetchTasks(userId, year, month) {
    const baseUrl = `/api/user/${userId}/tasks`;
    try {
        const response = await fetch(baseUrl);
        const tasks = await response.json();

        console.log('Tasks fetched:', tasks);

        tasks.forEach(task => {
            console.log('Processing task:', task);
            const taskDate = new Date(task.TaskDate);
            if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
                addTaskToCalendar(taskDate.getDate(), task);
            }
        });

    } catch (err) {
        console.error('Error fetching tasks:', err);
    }
}

function clearCalendarEvents() {
    const events = document.querySelectorAll('.event');
    events.forEach(event => event.remove());
}

function addAssessmentToCalendar(day, assessment) {
    const cells = document.querySelectorAll(`td[data-date="${day}"][data-month="${currentMonth + 1}"][data-year="${currentYear}"]`);
    console.log(`Adding assessment: ${assessment.AssessmentName} on day ${day}`, assessment);
    cells.forEach(cell => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event', 'assessment-event');  // Added class for assessments
        eventDiv.textContent = `${assessment.ModuleID} - ${assessment.AssessmentName}`;
        eventDiv.setAttribute('data-module-name', assessment.ModuleName);
        eventDiv.setAttribute('data-assessment-name', assessment.AssessmentName);
        eventDiv.setAttribute('data-assessment-type', assessment.AssessmentType);
        eventDiv.setAttribute('data-assessment-description', assessment.AssessmentDescription);
        eventDiv.setAttribute('data-assessment-date', assessment.AssessmentDate);
        eventDiv.setAttribute('data-weighting', assessment.Weighting);
        eventDiv.addEventListener('click', () => {
            openAssessmentModal(
                assessment.ModuleName,
                assessment.AssessmentName,
                assessment.AssessmentType,
                assessment.AssessmentDescription,
                assessment.AssessmentDate,
                assessment.Weighting
            );
        });
        cell.appendChild(eventDiv);
    });
}

function addTaskToCalendar(day, task) {
    const cells = document.querySelectorAll(`td[data-date="${day}"][data-month="${currentMonth + 1}"][data-year="${currentYear}"]`);
    console.log(`Adding task: ${task.TaskName} on day ${day}`, task);
    cells.forEach(cell => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event', 'task-event');  
        eventDiv.textContent = `${task.ModuleID} - ${task.TaskName}`;
        eventDiv.setAttribute('data-module-name', task.ModuleName);
        eventDiv.setAttribute('data-task-name', task.TaskName);
        eventDiv.setAttribute('data-type-name', task.TypeName);
        eventDiv.setAttribute('data-time-spent', task.TimeSpent);
        eventDiv.addEventListener('click', () => {
            openTaskModal(
                task.ModuleName,
                task.TaskName,
                task.TypeName,
                task.Notes || 'No additional details provided.',
                task.TaskDate,
                task.TimeSpent
            );
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
    showCalendar(currentMonth, currentYear, currentUserId);
}

function openAssessmentModal(moduleName, assessmentName, typeName, description, date, weighting) {
    console.log("Modal opening with data:", moduleName, assessmentName, typeName, description, date, weighting);
    const modal = document.getElementById('modal');
    const detailsElement = document.getElementById('modal-details');
    const dateParts = date.split('/');
    const formattedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toLocaleDateString();
    detailsElement.innerHTML = `
        <h2>${assessmentName}</h2>
        <p><strong>Module:</strong> ${moduleName}</p>
        <p><strong>Type:</strong> ${typeName}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Weighting:</strong> ${weighting}</p>
    `;
    modal.style.display = 'block'; // Show the modal
}

function openTaskModal(moduleName, taskName, typeName, description, date, timeSpent) {
    console.log("Modal opening with data:", moduleName, taskName, typeName, description, date, timeSpent);
    const modal = document.getElementById('modal');
    const detailsElement = document.getElementById('modal-details');
    const formattedDate = new Date(date).toLocaleDateString();
    detailsElement.innerHTML = `
        <h2>${taskName}</h2>
        <p><strong>Module:</strong> ${moduleName}</p>
        <p><strong>Type:</strong> ${typeName}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time Spent:</strong> ${timeSpent} hours</p>
    `;
    modal.style.display = 'block'; // Show the modal
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none'; // Hide the modal
}


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


const style = document.createElement('style');
style.innerHTML = `
    .assessment-event {
        border-left: 4px solid red;
    }
    .task-event {
        border-left: 4px solid blue;
    }
`;
document.head.appendChild(style);