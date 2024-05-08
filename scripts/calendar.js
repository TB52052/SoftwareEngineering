document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    let currentMonth = new Date();

    function drawCalendar(month) {
        calendarEl.innerHTML = ''; // Clear previous calendar cells
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.textContent = day;

            // Example: Load events for each day
            const eventEl = document.createElement('div');
            eventEl.classList.add('event');
            eventEl.textContent = 'Sample Event';
            dayEl.appendChild(eventEl);

            calendarEl.appendChild(dayEl);
        }
    }

    drawCalendar(currentMonth);

    prevMonthBtn.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        drawCalendar(currentMonth);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        drawCalendar(currentMonth);
    });
});
