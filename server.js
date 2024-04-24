// Modules
const express = require('express'); 

// App
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}));

// Routes
const loginRoute = require('./routes/login_route');
const registerRoute = require('./routes/register_route');
const calendarRoute = require('./routes/calendar_route');
const tasksRoute = require('./routes/tasks_route');
const dashboardRoute = require('./routes/dashboard_route');
const profileRoute = require('./routes/profile_route');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/calendar', calendarRoute);
app.use('/tasks', tasksRoute);
app.use('/dashboard', dashboardRoute);
app.use('/profile', profileRoute);

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/team', (req, res) => {
    res.render('team.ejs');
});

app.listen(PORT);